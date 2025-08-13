import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Adjust path as needed

// Helper function for authentication (replace with your actual auth check)
async function isAuthenticated(req: NextRequest) {
  // Implement your authentication logic here
  // For example, check for a session or token
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return null; // Not authenticated
  }
  // Example: verify a token or session
  // const { user } = await supabase.auth.api.getUser(authHeader.split(' ')[1]);
  // return user;
  return { id: 'placeholder-user-id' }; // Placeholder for authenticated user
}

// Helper to check if user is authorized to view PDF (e.g., belongs to a batch, or is public)
async function isAuthorizedToViewPdf(userId: string | null, pdfId: string) {
  // Implement your authorization logic here
  // e.g., check batch membership, public access flags, etc.
  console.log(`Checking authorization for user ${userId} on PDF ${pdfId}`);
  return true; // Placeholder: allow all access for now
}

// GET /api/pdf/list
export async function GET(req: NextRequest) {
  try {
    // Optional: check if user is authenticated or has permission to list PDFs
    // const user = await isAuthenticated(req);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Fetch a list of available PDFs (metadata only)
    // In a real app, you might filter based on user role or batch membership
    const { data, error } = await supabase
      .from('pdfs') // Assuming a 'pdfs' table with id, title, subject, preview_url, read_only columns
      .select('id, title, subject, read_only, preview_url');

    if (error) {
      console.error('Error fetching PDF list:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data to match the requested output format
    const pdfList = data.map(pdf => ({
      id: pdf.id,
      title: pdf.title,
      subject: pdf.subject,
      readOnly: pdf.read_only,
      preview: pdf.preview_url, // Assuming preview_url is a string path or URL
    }));

    return NextResponse.json(pdfList);

  } catch (error: any) {
    console.error('Unexpected error listing PDFs:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/pdf/view/:id
export async function GET_VIEW(req: NextRequest, { params }: { params: { id: string } }) {
  const pdfId = params.id;

  try {
    const user = await isAuthenticated(req);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Check if the user is authorized to view this specific PDF
    // if (!await isAuthorizedToViewPdf(user?.id || null, pdfId)) {
    //    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // Fetch PDF information to get the file path/storage location
    const { data: pdfData, error: pdfError } = await supabase
      .from('pdfs')
      .select('file_path') // Assuming 'file_path' is the column storing the path in Supabase Storage
      .eq('id', pdfId)
      .single();

    if (pdfError || !pdfData) {
      console.error('Error fetching PDF file path:', pdfError?.message || 'PDF not found');
      return NextResponse.json({ error: 'PDF not found' }, { status: 404 });
    }

    // Generate a signed URL for the PDF file in Supabase Storage
    // This provides view-only access for a limited time
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('pdfs') // Assuming your PDF bucket is named 'pdfs'
      .createSignedUrl(pdfData.file_path, 60 * 60); // URL valid for 1 hour

    if (signedUrlError) {
      console.error('Error generating signed URL:', signedUrlError.message);
      return NextResponse.json({ error: 'Could not generate PDF view link' }, { status: 500 });
    }

    // You can either redirect to the signed URL or proxy the stream.
    // Redirecting is simpler for basic view-only access in a browser.
    // Proxying might be needed for more control (e.g., adding headers, basic DRM).
    // For this example, we'll return the signed URL.

    // Note on preventing downloads: Signed URLs make it harder but don't fully prevent download.
    // Browsers can still download the file from the URL. Full DRM is complex and
    // typically requires dedicated services.

    // Mobile FLAG_SECURE notes: On Android, setting FLAG_SECURE prevents screenshots
    // and recording of the app's screen. This is a native app feature, not something
    // controlled by a web API. You would need to implement this in your mobile app
    // when displaying the PDF content.

    const signedUrl = signedUrlData.signedUrl;

    // Option 1: Redirect (simpler)
    // return NextResponse.redirect(signedUrl);

    // Option 2: Return the signed URL for the client to fetch (allows more client control)
    return NextResponse.json({ viewUrl: signedUrl });

  } catch (error: any) {
    console.error('Unexpected error viewing PDF:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


// POST /api/pdf/annotate
export async function POST(req: NextRequest) {
  try {
    const user = await isAuthenticated(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pdf_id, page, rect, text_excerpt, color } = await req.json();

    if (!pdf_id || page === undefined || !rect || !text_excerpt || !color) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Basic validation for rect structure (e.g., array of numbers)
    if (!Array.isArray(rect) || rect.some(isNaN)) {
       return NextResponse.json({ error: 'Invalid rect format' }, { status: 400 });
    }

    // Save the annotation to the 'annotations' table
    const { data, error } = await supabase
      .from('annotations')
      .insert([
        { user_id: user.id, pdf_id, page, rect, text_excerpt, color }
      ]);

    if (error) {
      console.error('Error saving annotation:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Annotation saved successfully', data });

  } catch (error: any) {
    console.error('Unexpected error annotating PDF:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/pdf/annotations/:pdf_id?user_id=
// Note: In App Router, dynamic segments are handled differently.
// The dynamic segment ":pdf_id" is captured by the folder structure: app/api/pdf/[pdf_id]/annotations/route.ts
// This GET handler should be in app/api/pdf/[pdf_id]/annotations/route.ts
/*
// This code should be in app/api/pdf/[pdf_id]/annotations/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Adjust path as needed

export async function GET(req: NextRequest, { params }: { params: { pdf_id: string } }) {
  const pdfId = params.pdf_id;
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id');

  try {
    const authenticatedUser = await isAuthenticated(req);
    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure the user requesting annotations is either the authenticated user or
    // has permission to view annotations for the requested user (e.g., professor role)
    // For now, only allow fetching annotations for the authenticated user.
    if (!userId || userId !== authenticatedUser.id) {
         // In a real app, check roles or permissions to allow fetching other users' annotations
         return NextResponse.json({ error: 'Forbidden: Cannot access other users\' annotations' }, { status: 403 });
    }


    // Fetch annotations for the specified PDF and user
    const { data, error } = await supabase
      .from('annotations')
      .select('*')
      .eq('pdf_id', pdfId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching annotations:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Unexpected error fetching annotations:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
*/

// Add security headers - these are generally added at the server/hosting level (e.g., Vercel, Nginx)
// but you can set some in the response headers if proxying content.
// For signed URLs, Supabase handles some of this.
// Example of setting headers in a NextResponse:
// return new NextResponse(JSON.stringify({ viewUrl: signedUrl }), {
//   headers: {
//     'Content-Security-Policy': "default-src 'self';",
//     'X-Content-Type-Options': 'nosniff',
//     'X-Frame-Options': 'DENY',
//     'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
//   }
// });

// Explanations on limitations:
/*
Security Limitations:
- Preventing Downloads: On the web, it's inherently difficult to completely prevent users from downloading content they can view. Signed URLs add a layer of protection by making links time-limited and tied to specific access rights, but tools and browser features can still be used to save the file. True DRM requires complex systems often involving encryption and licensing.
- Screenshot Prevention (Mobile): The `FLAG_SECURE` setting is a native mobile OS feature (Android) that prevents screenshots/recording of the app's window. This is implemented within the mobile application code (e.g., in Java/Kotlin for Android, Swift/Objective-C for iOS - though iOS handles this differently) and is not controlled via web API response headers. Your mobile wrapper around this web app would need to implement this natively when the PDF viewer component is active.
*/
