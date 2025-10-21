import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Format currency for display
 */
function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "-";
  try {
    return new Intl.NumberFormat("en-ZM", {
      style: "currency",
      currency: "ZMW",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  } catch {
    return `K${Number(amount || 0).toFixed(0)}`;
  }
}

/**
 * Format date for display
 */
function formatDate(value) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return String(value);
  }
}

/**
 * Generate Admin Dashboard Report
 */
export function generateAdminDashboardReport(data) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.text("Admin Dashboard Report", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 30, {
    align: "center",
  });

  let yPosition = 50;

  // Summary Statistics
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("Summary Statistics", 20, yPosition);
  yPosition += 15;

  doc.setFontSize(12);
  doc.setFont(undefined, "normal");

  const summaryData = [
    ["Total Campaigns", data.aggregates?.totalCampaigns || 0],
    ["Active Campaigns", data.aggregates?.activeCampaigns || 0],
    ["Pending Approval", data.aggregates?.pendingApproval || 0],
    ["Total Donations", data.aggregates?.totalDonations || 0],
    ["Total Raised", formatCurrency(data.aggregates?.totalRaised || 0)],
    ["Total Withdrawn", formatCurrency(data.aggregates?.totalWithdrawn || 0)],
    ["Unique Donors", data.aggregates?.uniqueDonors || 0],
    ["Total Organizers", data.aggregates?.totalOrganizers || 0],
    ["Total Individuals", data.aggregates?.totalIndividuals || 0],
    ["Total Admins", data.aggregates?.totalAdmins || 0],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [["Metric", "Value"]],
    body: summaryData,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 },
  });

  yPosition = doc.lastAutoTable.finalY + 20;

  // Top Campaigns
  if (data.aggregates?.campaignRows?.length > 0) {
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("Top Campaigns", 20, yPosition);
    yPosition += 15;

    const campaignData = data.aggregates.campaignRows
      .slice(0, 10)
      .map((campaign) => [
        campaign.name || "Unnamed Campaign",
        formatCurrency(campaign.raised || 0),
        formatCurrency(campaign.goal || 0),
        `${campaign.pct || 0}%`,
        campaign.status || "Unknown",
      ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Campaign Name", "Raised", "Goal", "Progress", "Status"]],
      body: campaignData,
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 9 },
    });

    yPosition = doc.lastAutoTable.finalY + 20;
  }

  // Top Donors
  if (data.aggregates?.topDonors?.length > 0) {
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("Top Donors", 20, yPosition);
    yPosition += 15;

    const donorData = data.aggregates.topDonors.map((donor) => [
      donor.name || "Anonymous",
      formatCurrency(donor.total || 0),
      donor.latestCampaignName || "N/A",
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Donor Name", "Total Donated", "Latest Campaign"]],
      body: donorData,
      theme: "grid",
      headStyles: { fillColor: [139, 92, 246] },
      styles: { fontSize: 9 },
    });

    yPosition = doc.lastAutoTable.finalY + 20;
  }

  // Recent Donations
  if (data.aggregates?.recentDonations?.length > 0) {
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("Recent Donations", 20, yPosition);
    yPosition += 15;

    const donationData = data.aggregates.recentDonations
      .slice(0, 15)
      .map((donation) => [
        donation.isAnonymous
          ? "Anonymous"
          : donation.donorDetails?.displayName || donation.donorName || "Donor",
        formatCurrency(donation.amount || 0),
        donation.campaignName || "N/A",
        formatDate(donation.donationDate),
      ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Donor", "Amount", "Campaign", "Date"]],
      body: donationData,
      theme: "grid",
      headStyles: { fillColor: [245, 158, 11] },
      styles: { fontSize: 8 },
    });
  }

  return doc;
}

/**
 * Generate Organizer Dashboard Report
 */
export function generateOrganizerDashboardReport(data) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.text("Organizer Dashboard Report", pageWidth / 2, 20, {
    align: "center",
  });

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 30, {
    align: "center",
  });

  let yPosition = 50;

  // Summary Statistics
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("My Campaign Summary", 20, yPosition);
  yPosition += 15;

  doc.setFontSize(12);
  doc.setFont(undefined, "normal");

  const summaryData = [
    ["Total Campaigns", data.totals?.totalCampaigns || 0],
    ["Total Donations", data.totals?.totalDonations || 0],
    ["Total Raised", formatCurrency(data.totals?.totalRaised || 0)],
    ["Total Withdrawn", formatCurrency(data.totals?.totalWithdrawn || 0)],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [["Metric", "Value"]],
    body: summaryData,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 },
  });

  yPosition = doc.lastAutoTable.finalY + 20;

  // My Campaigns
  if (data.campaigns?.length > 0) {
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("My Campaigns", 20, yPosition);
    yPosition += 15;

    const campaignData = data.campaigns.map((campaign) => {
      const raised = data.campaignRaisedMap?.[campaign.campaignId] || 0;
      const goal = Number(campaign.goalAmount || 0);
      const pct =
        goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

      return [
        campaign.name || "Unnamed Campaign",
        formatCurrency(raised),
        formatCurrency(goal),
        `${pct}%`,
        campaign.status || "Unknown",
        formatDate(campaign.startDate),
        formatDate(campaign.endDate),
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [
        [
          "Campaign Name",
          "Raised",
          "Goal",
          "Progress",
          "Status",
          "Start Date",
          "End Date",
        ],
      ],
      body: campaignData,
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 8 },
    });

    yPosition = doc.lastAutoTable.finalY + 20;
  }

  // Top Donors
  if (data.topDonors?.length > 0) {
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("My Top Donors", 20, yPosition);
    yPosition += 15;

    const donorData = data.topDonors.map((donor) => [
      donor.name || "Anonymous",
      formatCurrency(donor.total || 0),
      donor.latestCampaignName || "N/A",
      formatDate(donor.lastDate),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [
        ["Donor Name", "Total Donated", "Latest Campaign", "Last Donation"],
      ],
      body: donorData,
      theme: "grid",
      headStyles: { fillColor: [139, 92, 246] },
      styles: { fontSize: 9 },
    });

    yPosition = doc.lastAutoTable.finalY + 20;
  }

  // Recent Donations
  if (data.recentDonors?.length > 0) {
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("Recent Donations", 20, yPosition);
    yPosition += 15;

    const donationData = data.recentDonors
      .slice(0, 15)
      .map((donation) => [
        donation.isAnonymous
          ? "Anonymous"
          : donation.donorDetails?.displayName || donation.donorName || "Donor",
        formatCurrency(donation.amount || 0),
        donation.campaignName || "N/A",
        formatDate(donation.donationDate),
      ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Donor", "Amount", "Campaign", "Date"]],
      body: donationData,
      theme: "grid",
      headStyles: { fillColor: [245, 158, 11] },
      styles: { fontSize: 8 },
    });
  }

  return doc;
}

/**
 * Generate Campaign Report
 */
export function generateCampaignReport(
  campaign,
  donations = [],
  withdrawals = []
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.text("Campaign Report", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text(campaign.name || "Unnamed Campaign", pageWidth / 2, 30, {
    align: "center",
  });

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 40, {
    align: "center",
  });

  let yPosition = 60;

  // Campaign Details
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("Campaign Details", 20, yPosition);
  yPosition += 15;

  const campaignDetails = [
    ["Campaign Name", campaign.name || "N/A"],
    [
      "Description",
      (campaign.description || "N/A").substring(0, 100) +
        (campaign.description?.length > 100 ? "..." : ""),
    ],
    ["Goal Amount", formatCurrency(campaign.goalAmount || 0)],
    ["Current Raised", formatCurrency(campaign.currentRaisedAmount || 0)],
    ["Total Withdrawn", formatCurrency(campaign.totalWithdrawn || 0)],
    [
      "Available Balance",
      formatCurrency(
        (campaign.currentRaisedAmount || 0) - (campaign.totalWithdrawn || 0)
      ),
    ],
    ["Status", campaign.status || "Unknown"],
    ["Start Date", formatDate(campaign.startDate)],
    ["End Date", formatDate(campaign.endDate)],
    ["Organizer ID", campaign.organizerId || "N/A"],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [["Field", "Value"]],
    body: campaignDetails,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 10 },
  });

  yPosition = doc.lastAutoTable.finalY + 20;

  // Donations Summary
  if (donations.length > 0) {
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("Donations Summary", 20, yPosition);
    yPosition += 15;

    const totalDonations = donations.length;
    const totalAmount = donations.reduce(
      (sum, d) => sum + Number(d.amount || 0),
      0
    );
    const anonymousCount = donations.filter((d) => d.isAnonymous).length;
    const uniqueDonors = new Set(
      donations
        .filter((d) => !d.isAnonymous)
        .map((d) => d.donorUserId || d.donorDetails?.donorId)
    ).size;

    const donationSummary = [
      ["Total Donations", totalDonations],
      ["Total Amount", formatCurrency(totalAmount)],
      ["Anonymous Donations", anonymousCount],
      ["Unique Donors", uniqueDonors],
      ["Average Donation", formatCurrency(totalAmount / totalDonations)],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [["Metric", "Value"]],
      body: donationSummary,
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 10 },
    });

    yPosition = doc.lastAutoTable.finalY + 20;

    // Recent Donations
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("Recent Donations", 20, yPosition);
    yPosition += 15;

    const recentDonations = donations
      .sort((a, b) => new Date(b.donationDate) - new Date(a.donationDate))
      .slice(0, 20);

    const donationData = recentDonations.map((donation) => [
      donation.isAnonymous
        ? "Anonymous"
        : donation.donorDetails?.displayName || donation.donorName || "Donor",
      formatCurrency(donation.amount || 0),
      formatDate(donation.donationDate),
      donation.status || "Unknown",
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Donor", "Amount", "Date", "Status"]],
      body: donationData,
      theme: "grid",
      headStyles: { fillColor: [139, 92, 246] },
      styles: { fontSize: 8 },
    });

    yPosition = doc.lastAutoTable.finalY + 20;
  }

  // Withdrawals
  if (withdrawals.length > 0) {
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("Withdrawal History", 20, yPosition);
    yPosition += 15;

    const withdrawalData = withdrawals.map((withdrawal) => [
      formatCurrency(withdrawal.amount || 0),
      withdrawal.status || "Unknown",
      formatDate(withdrawal.requestDate || withdrawal.createdAt),
      withdrawal.phoneNumber || "N/A",
      withdrawal.network || "N/A",
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["Amount", "Status", "Request Date", "Phone", "Network"]],
      body: withdrawalData,
      theme: "grid",
      headStyles: { fillColor: [245, 158, 11] },
      styles: { fontSize: 8 },
    });
  }

  return doc;
}

/**
 * Download PDF report
 */
export function downloadPDFReport(doc, filename) {
  doc.save(filename || `report-${new Date().toISOString().split("T")[0]}.pdf`);
}
