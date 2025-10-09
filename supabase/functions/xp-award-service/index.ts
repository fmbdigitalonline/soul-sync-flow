import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 7-Dimension XP System
type Dim = 'SIP' | 'CMP' | 'PCP' | 'HPP' | 'COV' | 'LVP' | 'ADP';

interface ProgressEvent {
  timestamp: number;
  dims: Partial<Record<Dim, number>>;
  quality: number;
  kinds: string[];
}

interface ProgressState {
  xp_total: number;
  dim_scores_ewma: Record<Dim, number>;
  session_xp: number;
  daily_xp: number;
  weekly_xp: number;
  repeats_today: Record<string, number>;
  last_reset_day: string;
  last_reset_week: number;
  last_milestone_hit: number;
  last_adp_at?: number;
}

// Configuration constants
const Config = {
  dimCap: 6,
  sessionCap: 30,
  dayCap: 100,
  weekCap: 500,
  noveltyBonus: 1.5,
  ewmaAlpha: 0.3,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, dims, quality, kinds, source } = await req.json();

    if (!userId || !dims || quality === undefined || !kinds) {
      throw new Error('Missing required parameters: userId, dims, quality, kinds');
    }

    console.log('📊 XP Award Service:', { userId: userId.substring(0, 8), dims, quality, kinds, source });

    const supabase = createClient(supabaseUrl, supabaseKey);
    const now = new Date();

    // Fetch current user XP state
    const { data: currentState, error: fetchError } = await supabase
      .from('user_xp_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // Initialize state if not exists
    let state: ProgressState = currentState ? {
      xp_total: currentState.xp_total,
      dim_scores_ewma: currentState.dim_scores_ewma,
      session_xp: currentState.session_xp,
      daily_xp: currentState.daily_xp,
      weekly_xp: currentState.weekly_xp,
      repeats_today: currentState.repeats_today || {},
      last_reset_day: currentState.last_reset_day,
      last_reset_week: currentState.last_reset_week,
      last_milestone_hit: currentState.last_milestone_hit,
      last_adp_at: currentState.last_adp_at,
    } : {
      xp_total: 1200,
      dim_scores_ewma: { SIP: 50, CMP: 50, PCP: 50, HPP: 50, COV: 50, LVP: 50, ADP: 50 },
      session_xp: 0,
      daily_xp: 0,
      weekly_xp: 0,
      repeats_today: {},
      last_reset_day: now.toISOString().split('T')[0],
      last_reset_week: getWeekNumber(now),
      last_milestone_hit: 0,
    };

    // Handle rollovers
    state = handleRollovers(state, now);

    // Fetch recent event kinds for novelty detection
    const { data: recentEvents } = await supabase
      .from('user_xp_events')
      .select('event_kinds')
      .eq('user_id', userId)
      .gte('timestamp', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false })
      .limit(50);

    const recentKinds = (recentEvents || []).flatMap((e: any) => 
      (e.event_kinds || []).map((kind: string) => ({ kind, at: Date.now() }))
    );

    // Award XP
    const event: ProgressEvent = {
      timestamp: Date.now(),
      dims,
      quality: Math.max(0, Math.min(1, quality)),
      kinds,
    };

    const result = awardXP(state, event, recentKinds);
    const newState = result.state;
    const deltaXP = result.deltaXP;

    // Check for milestone gates
    const percent = xpToPercent(newState.xp_total);
    const gateCheck = passesGates(percent, newState.dim_scores_ewma, newState.last_adp_at, now.getTime());

    // Update database
    await supabase
      .from('user_xp_progress')
      .upsert({
        user_id: userId,
        xp_total: newState.xp_total,
        dim_scores_ewma: newState.dim_scores_ewma,
        session_xp: newState.session_xp,
        daily_xp: newState.daily_xp,
        weekly_xp: newState.weekly_xp,
        repeats_today: newState.repeats_today,
        last_reset_day: newState.last_reset_day,
        last_reset_week: newState.last_reset_week,
        last_milestone_hit: newState.last_milestone_hit,
        last_adp_at: newState.last_adp_at,
        updated_at: now.toISOString(),
      }, {
        onConflict: 'user_id'
      });

    // Log XP event
    await supabase
      .from('user_xp_events')
      .insert({
        user_id: userId,
        occurred_at: now.toISOString(),
        delta_xp: deltaXP,
        xp_total_after: newState.xp_total,
        dims: dims,
        quality: quality,
        kinds: kinds,
        note: `Source: ${source || 'unknown'}`,
      });

    console.log('✅ XP Awarded:', { 
      deltaXP, 
      newTotal: newState.xp_total, 
      percent: Math.round(percent * 100),
      topContributors: result.topContributors 
    });

    return new Response(JSON.stringify({
      success: true,
      deltaXP,
      newXPTotal: newState.xp_total,
      progressPercent: percent,
      topContributors: result.topContributors,
      passesGates: gateCheck.passes,
      blockedReason: gateCheck.blockedReason,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ XP Award Service error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper functions (copied from xp-progression-service.ts)
function xpToPercent(xp: number): number {
  const mid = 1200;
  const scale = 250;
  return 1 / (1 + Math.exp(-(xp - mid) / scale));
}

function diminishing(base: number, cap: number, current: number): number {
  if (current >= cap) return 0;
  const ratio = current / cap;
  return base * (1 - ratio);
}

function awardXP(
  state: ProgressState,
  ev: ProgressEvent,
  recentKinds: { kind: string; at: number }[]
): { state: ProgressState; deltaXP: number; topContributors: Array<{ dim: Dim; xp: number }> } {
  const newState = { ...state, repeats_today: { ...state.repeats_today } };
  let totalXP = 0;
  const contributors: Array<{ dim: Dim; xp: number }> = [];

  console.log('🔍 XP CALC: Starting calculation with state:', {
    session_xp: newState.session_xp,
    daily_xp: newState.daily_xp,
    weekly_xp: newState.weekly_xp,
    xp_total: newState.xp_total
  });

  for (const dim of Object.keys(ev.dims) as Dim[]) {
    let rawXP = ev.dims[dim]!;
    console.log(`🔍 XP CALC: Processing ${dim}, raw: ${rawXP}`);
    
    // Apply quality multiplier directly - dimension scores track progress, not caps
    rawXP *= ev.quality;
    console.log(`🔍 XP CALC: After quality (${ev.quality}): ${rawXP}`);

    if (rawXP <= 0) {
      console.log(`🔍 XP CALC: Skipping ${dim}, rawXP <= 0`);
      continue;
    }

    const diversityBonus = Object.keys(ev.dims).length > 2 ? 1.1 : 1.0;
    rawXP *= diversityBonus;
    console.log(`🔍 XP CALC: After diversity bonus (${diversityBonus}): ${rawXP}`);

    totalXP += rawXP;
    newState.dim_scores_ewma[dim] = 
      Config.ewmaAlpha * rawXP + (1 - Config.ewmaAlpha) * newState.dim_scores_ewma[dim];

    contributors.push({ dim, xp: rawXP });
  }

  console.log('🔍 XP CALC: Total before novelty/caps:', totalXP);

  // Novelty bonus
  const allNovel = ev.kinds.every(
    k => !recentKinds.some(r => r.kind === k && Date.now() - r.at < 3600000)
  );
  if (allNovel && ev.kinds.length > 0) {
    totalXP *= Config.noveltyBonus;
    console.log(`🔍 XP CALC: After novelty bonus (${Config.noveltyBonus}): ${totalXP}`);
  }

  // Apply caps
  const beforeSessionCap = totalXP;
  totalXP = diminishing(totalXP, Config.sessionCap, newState.session_xp);
  console.log(`🔍 XP CALC: After session cap (${beforeSessionCap} -> ${totalXP}), session_xp: ${newState.session_xp}/${Config.sessionCap}`);
  
  const beforeDayCap = totalXP;
  totalXP = diminishing(totalXP, Config.dayCap, newState.daily_xp);
  console.log(`🔍 XP CALC: After day cap (${beforeDayCap} -> ${totalXP}), daily_xp: ${newState.daily_xp}/${Config.dayCap}`);
  
  const beforeWeekCap = totalXP;
  totalXP = diminishing(totalXP, Config.weekCap, newState.weekly_xp);
  console.log(`🔍 XP CALC: After week cap (${beforeWeekCap} -> ${totalXP}), weekly_xp: ${newState.weekly_xp}/${Config.weekCap}`);

  if (totalXP > 0) {
    newState.xp_total += totalXP;
    newState.session_xp += totalXP;
    newState.daily_xp += totalXP;
    newState.weekly_xp += totalXP;

    ev.kinds.forEach(k => {
      newState.repeats_today[k] = (newState.repeats_today[k] || 0) + 1;
    });
  }

  return { 
    state: newState, 
    deltaXP: totalXP,
    topContributors: contributors.sort((a, b) => b.xp - a.xp).slice(0, 3)
  };
}

function passesGates(
  percent: number,
  dims: Record<Dim, number>,
  lastADPAt?: number,
  now?: number
): { passes: boolean; blockedReason?: string } {
  if (percent >= 0.7) {
    if (dims.SIP < 65) return { passes: false, blockedReason: 'SIP < 65' };
    if (dims.PCP < 60) return { passes: false, blockedReason: 'PCP < 60' };
  }
  if (percent >= 0.85) {
    if (dims.HPP < 70) return { passes: false, blockedReason: 'HPP < 70' };
    const daysSinceADP = lastADPAt && now ? (now - lastADPAt) / 86400000 : 999;
    if (daysSinceADP > 14) return { passes: false, blockedReason: 'No ADP in 14 days' };
  }
  return { passes: true };
}

function handleRollovers(state: ProgressState, now: Date): ProgressState {
  const newState = { ...state };
  const today = now.toISOString().split('T')[0];
  const thisWeek = getWeekNumber(now);

  if (newState.last_reset_day !== today) {
    newState.daily_xp = 0;
    newState.repeats_today = {};
    newState.last_reset_day = today;
  }

  if (newState.last_reset_week !== thisWeek) {
    newState.weekly_xp = 0;
    newState.last_reset_week = thisWeek;
  }

  return newState;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
