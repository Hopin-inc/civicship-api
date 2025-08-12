import FormData from 'form-data';
import fetch from 'node-fetch';

async function testNullFileUpload() {
  const operations = {
    query: `
      mutation($input: OpportunityCreateInput!, $permission: CheckCommunityPermissionInput!) {
        opportunityCreate(input: $input, permission: $permission) {
          ... on OpportunityCreateSuccess {
            opportunity {
              id
              title
            }
          }
        }
      }
    `,
    variables: {
      input: {
        title: "Test Opportunity",
        description: "Test Description",
        category: "EVENT",
        publishStatus: "PUBLISHED",
        requireApproval: false,
        feeRequired: 0,
        images: [
          { "file": null, "alt": "", "caption": "" },
          { "file": null, "alt": "", "caption": "" }
        ],
        slots: [
          {
            capacity: 50,
            startsAt: "2025-05-13T00:00:00+09:00",
            endsAt: "2025-07-24T23:59:59+09:00"
          }
        ],
        createdBy: "test-user"
      },
      permission: {
        communityId: "test-community-id"
      }
    }
  };

  const map = {
    "file1": ["variables.input.images.0.file"],
    "file2": ["variables.input.images.1.file"]
  };

  const form = new FormData();
  form.append('operations', JSON.stringify(operations));
  form.append('map', JSON.stringify(map));

  try {
    console.log('Testing GraphQL request with null files...');
    console.log('This should NOT hang with the new custom processRequest implementation');
    
    const startTime = Date.now();
    const response = await fetch('http://localhost:3000/graphql', {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
      timeout: 10000 // 10 second timeout
    });

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ SUCCESS: Request completed in ${duration}ms`);
    console.log('Response status:', response.status);
    
    const result = await response.text();
    console.log('Response:', result.substring(0, 500) + (result.length > 500 ? '...' : ''));

    if (result.includes('File missing in the request')) {
      console.log('❌ ERROR: Still getting "File missing in the request" error');
      return false;
    } else {
      console.log('✅ SUCCESS: No "File missing in the request" error detected');
      return true;
    }
  } catch (error) {
    console.error('❌ Request failed or timed out:', error.message);
    if (error.message.includes('timeout')) {
      console.error('❌ CRITICAL: Request is still hanging - custom processRequest not working');
    }
    return false;
  }
}

testNullFileUpload();
