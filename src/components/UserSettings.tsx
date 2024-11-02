import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface UserInfo {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

const UserSettings: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        // Replace with your actual WooCommerce API endpoint
        const response = await axios.get<UserInfo>('https://your-woocommerce-site.com/wp-json/wc/v3/customers/me', {
          headers: {
            'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
          }
        });
        setUserInfo(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user information. Please check your WooCommerce connection.');
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (loading) return <div className="text-center">Loading user information...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!userInfo) return <div className="text-center">No user information available.</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">User Information</h2>
        <div className="space-y-3">
          <InfoItem label="Username" value={userInfo.username} />
          <InfoItem label="Email" value={userInfo.email} />
          <InfoItem label="First Name" value={userInfo.first_name} />
          <InfoItem label="Last Name" value={userInfo.last_name} />
          <InfoItem label="Customer ID" value={userInfo.id.toString()} />
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-600 font-medium">{label}:</span>
    <span className="text-gray-800">{value}</span>
  </div>
);

export default UserSettings;