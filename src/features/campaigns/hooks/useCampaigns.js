import { useState, useEffect } from "react";
import { getCampaignsByOrganizer } from "../services/campaignApi";

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const data = await getCampaignsByOrganizer();
        // Ensure data is an array
        const campaignsArray =  data?.data || [];

        setCampaigns(campaignsArray);
        setError(null);
      } catch (err) {
        console.error("Error fetching campaigns:", err);
        setError(err.message);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await getCampaignsByOrganizer();
      console.log("Campaigns data received (refetch):", data);
      // Ensure data is an array
      const campaignsArray = Array.isArray(data) ? data : data?.data || [];
      setCampaigns(campaignsArray);
      setError(null);
    } catch (err) {
      console.error("Error fetching campaigns (refetch):", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    campaigns,
    loading,
    error,
    refetch,
  };
};
