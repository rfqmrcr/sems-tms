import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DeleteCourseRequest {
  course_id: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { course_id }: DeleteCourseRequest = await req.json();

    if (!course_id) {
      return new Response(JSON.stringify({ error: 'course_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1) Get all course runs for this course
    const { data: courseRuns, error: runsError } = await supabase
      .from('course_runs')
      .select('id')
      .eq('course_id', course_id);

    if (runsError) throw runsError;

    const courseRunIds = courseRuns?.map(run => run.id) || [];

    // 2) Delete trainees associated with registrations for these course runs
    if (courseRunIds.length > 0) {
      const { data: registrations } = await supabase
        .from('registrations')
        .select('id')
        .in('course_run_id', courseRunIds);

      const registrationIds = registrations?.map(reg => reg.id) || [];

      if (registrationIds.length > 0) {
        // Delete attendance records
        await supabase
          .from('attendance')
          .delete()
          .in('registration_id', registrationIds);

        // Delete trainees
        await supabase
          .from('trainees')
          .delete()
          .in('registration_id', registrationIds);

        // Delete registrations
        await supabase
          .from('registrations')
          .delete()
          .in('id', registrationIds);
      }

      // Delete course runs
      await supabase
        .from('course_runs')
        .delete()
        .in('id', courseRunIds);
    }

    // 3) Delete email templates
    await supabase
      .from('email_templates')
      .delete()
      .eq('course_id', course_id);

    // 4) Delete the course
    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .eq('id', course_id);

    if (deleteError) throw deleteError;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('admin-delete-course error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});