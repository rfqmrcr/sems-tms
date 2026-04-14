/**
 * Debug wrapper for fetch that logs all API responses
 */
export const debugFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  
  console.log('[API REQUEST]', init?.method || 'GET', url);
  
  const response = await fetch(input, init);
  const clonedResponse = response.clone();
  
  try {
    const json = await clonedResponse.json();
    console.log(
      '[API RESPONSE]',
      url,
      response.status,
      JSON.stringify(json, null, 2)
    );
  } catch {
    // Not JSON, log as text
    const text = await clonedResponse.text();
    console.log('[API RESPONSE]', url, response.status, text);
  }
  
  return response;
};
