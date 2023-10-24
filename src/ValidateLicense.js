import axios from 'axios';
import React, { useEffect, useState } from 'react';

const ValidateLicense = () => {
  const [licenseInfo, setLicenseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLicenseInfo = async () => {
      try {
        const params = {
          'licenseKey': '62e448abcd415a26',
          'serviceId': 'CS2',
        };

        const response = await axios.get('https://secure-api.akros.ac/v1/ISession/ValidateLicense?licenseKey=62e448abcd415a26&serviceId=CS2', { params });
        setLicenseInfo(response.data);
      } catch (err) {
        console.error('Error fetching license information:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLicenseInfo();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>License Information</h1>
      {/* Render your license information here */}
      <pre>{JSON.stringify(licenseInfo, null, 2)}</pre>
    </div>
  );
};

export default ValidateLicense;
