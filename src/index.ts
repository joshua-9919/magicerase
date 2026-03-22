/**
 * MagicErase - AI-powered image eraser
 * Built with Cloudflare Workers + Clipdrop API
 */

export interface Env {
  CLIPDROP_API_KEY: string;
  __STATIC_CONTENT: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Serve static files from Cloudflare Pages
    if (request.method === 'GET') {
      // Root path - serve index.html
      if (url.pathname === '/' || url.pathname === '/index.html') {
        const asset = await env.__STATIC_CONTENT.get('index.html');
        if (asset) {
          return new Response(asset, {
            headers: {
              ...corsHeaders,
              'content-type': 'text/html;charset=UTF-8',
            },
          });
        }
      }

      // Serve other static assets
      const assetPath = url.pathname.replace(/^\//, '');
      if (assetPath.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico)$/)) {
        const asset = await env.__STATIC_CONTENT.get(assetPath);
        if (asset) {
          const contentType = getContentType(assetPath);
          return new Response(asset, {
            headers: {
              ...corsHeaders,
              'content-type': contentType,
            },
          });
        }
      }
    }

    // Handle API requests
    if (url.pathname === '/api/erase' && request.method === 'POST') {
      try {
        const formData = await request.formData();
        const imageFile = formData.get('image') as File;
        const maskFile = formData.get('mask') as File;

        if (!imageFile || !maskFile) {
          return new Response(
            JSON.stringify({ error: 'Missing image or mask file' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'content-type': 'application/json' },
            }
          );
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (imageFile.size > maxSize) {
          return new Response(
            JSON.stringify({ error: 'Image file too large. Max size: 10MB' }),
            {
              status: 413,
              headers: { ...corsHeaders, 'content-type': 'application/json' },
            }
          );
        }

        // Call Clipdrop API
        const clipdropForm = new FormData();
        clipdropForm.append('image_file', imageFile);
        clipdropForm.append('mask_file', maskFile);

        const clipdropResponse = await fetch('https://clipdrop-api.co/cleanup/v1', {
          method: 'POST',
          headers: {
            'x-api-key': env.CLIPDROP_API_KEY,
          },
          body: clipdropForm,
        });

        if (!clipdropResponse.ok) {
          const errorText = await clipdropResponse.text();
          console.error('Clipdrop API error:', errorText);
          return new Response(
            JSON.stringify({ 
              error: 'Failed to process image',
              details: errorText 
            }),
            {
              status: clipdropResponse.status,
              headers: { ...corsHeaders, 'content-type': 'application/json' },
            }
          );
        }

        // Return processed image
        const resultBuffer = await clipdropResponse.arrayBuffer();
        return new Response(resultBuffer, {
          headers: {
            ...corsHeaders,
            'content-type': 'image/png',
          },
        });
      } catch (error) {
        console.error('Error processing request:', error);
        return new Response(
          JSON.stringify({ error: 'Internal server error' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'content-type': 'application/json' },
          }
        );
      }
    }

    // 404 for unmatched routes
    return new Response('Not Found', { 
      status: 404,
      headers: corsHeaders 
    });
  },
};

function getContentType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const types: Record<string, string> = {
    'html': 'text/html;charset=UTF-8',
    'css': 'text/css',
    'js': 'application/javascript',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
  };
  return types[ext || 'text/plain'] || 'text/plain';
}
