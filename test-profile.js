const fetch = require('node-fetch');

async function test() {
  const token = process.argv[2];
  if (!token) {
    console.log("No token provided");
    return;
  }
  
  const res = await fetch('http://localhost:3000/api/users/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Cookie': `payload-token=${token}`
    }
  });

  const text = await res.text();
  console.log('STATUS:', res.status);
  console.log('RESPONSE:', text);
}

test();
