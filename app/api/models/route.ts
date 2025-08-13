import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // Adjust path as needed
import { Model3D } from '@/lib/types'; // Adjust path as needed

// Seed reference model in seed.sql is a manual step described in the prompt,
// not implemented directly in this API route.
// This API is responsible for serving metadata about 3D models.

// Placeholder data structure for model metadata (should come from database)
const sampleModels: Model3D[] = [
  {
    // Example model metadata
    id: 'model-1',
    name: 'Human Heart',
    regions: ['Atria', 'Ventricles', 'Valves'],
    thumbnail_url: '/path/to/heart-thumbnail.png', // Placeholder thumbnail URL
    file_url: '/models/heart.glb', // Placeholder file URL (GLTF/GLB)
    metadata: {
      description: 'A detailed 3D model of the human heart.',
      creator: 'MedMaster',
      // Add other relevant metadata
    },
  },
  // Add more sample models as needed
];

// Handles GET requests for 3D model data.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const list = searchParams.get('list');

  try {
    // Handle request to list all models
    if (list !== null) {
      // Implement fetching list of models from database
      // For now, return sample data
      const modelList = sampleModels.map(({ id, name, regions, thumbnail_url }) => ({
        // Selecting specific fields for the list view
        // This helps keep the initial list payload smaller
        id,
        name,
        regions,
        thumbnail_url,
      }));
      return NextResponse.json(modelList);
    } else if (id) {
      // Handle request for a specific model by ID
      // Implement fetching a specific model from database
      // For now, find in sample data
      const model = sampleModels.find(m => m.id === id);
      if (model) {
        // In a real application, you might generate a signed URL for the file_url
        // to control access and expiration of the model file itself.
        return NextResponse.json(model);
      } else {
        // Return 404 if the model is not found
        return NextResponse.json({ error: 'Model not found' }, { status: 404 });
      }
    } else {
      // Return 400 for invalid requests that don't specify id or list
      return NextResponse.json({ error: 'Invalid request. Specify id or list.' }, { status: 400 });
    }
  } catch (error) {
    // Log and return a 500 error for any unexpected issues
  } catch (error) {
    console.error('Error fetching 3D models:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Example of how you might add a POST for uploading models (Professor only)
// export async function POST(req: NextRequest) {
//   // Implement professor authentication
//   // Use Supabase Storage to handle file uploads
//   // Save model metadata to the database
//   return NextResponse.json({ message: 'Model upload not yet implemented' }, { status: 501 });
// }