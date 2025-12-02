import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint');
    
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: 'Endpoint parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('TMDB_API_KEY');
    if (!apiKey) {
      console.error('CRITICAL: TMDB_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({ 
          error: 'TMDB_API_KEY environment variable is NOT SET. Cannot proceed with API requests.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Build TMDB API URL
    const tmdbUrl = new URL(`https://api.themoviedb.org/3${endpoint}`);
    
    // Copy all query parameters except 'endpoint'
    url.searchParams.forEach((value, key) => {
      if (key !== 'endpoint') {
        tmdbUrl.searchParams.append(key, value);
      }
    });
    
    // Add API key
    tmdbUrl.searchParams.append('api_key', apiKey);

    console.log('Fetching from TMDB:', tmdbUrl.pathname);

    const response = await fetch(tmdbUrl.toString());
    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { 
        status: response.status,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
        } 
      }
    );
  } catch (error) {
    console.error('Error in TMDB proxy:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});