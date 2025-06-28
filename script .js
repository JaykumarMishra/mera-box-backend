const backendUrl = "https://mera-box-backend-1.onrender.com";

function playVideo() {
  const url = document.getElementById("videoUrl").value.trim();
  const iframe = document.getElementById("videoPlayer");
  iframe.style.display = "block";

  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    if (match) iframe.src = `https://www.youtube.com/embed/${match[1]}`;
    else alert("Invalid YouTube URL");
  }

  else if (url.includes("dailymotion.com")) {
    const match = url.match(/video\/([a-zA-Z0-9]+)/);
    if (match) iframe.src = `https://www.dailymotion.com/embed/video/${match[1]}`;
    else alert("Invalid Dailymotion URL");
  }

  else if (url.includes("xvideos.com") || url.includes("terabox.com") || url.includes("1024tera.com")) {
    iframe.style.display = "none";
    alert("Preview not supported. You can only download.");
  }

  else {
    iframe.src = url;
  }
}

async function downloadVideo() {
  const url = document.getElementById("videoUrl").value.trim();
  const format = document.getElementById("formatSelect").value;
  if (!url) return alert("Please enter a video URL.");

  try {
    const res = await fetch(`${backendUrl}/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, format })
    });

    if (!res.ok) throw new Error("Download failed");

    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `video.${format}`;
    a.click();
  } catch (err) {
    alert("Download failed: " + err.message);
  }
}

function togglePremium() {
  const premium = document.getElementById("premiumToggle").checked;
  const adContainer = document.getElementById("ad-container");
  adContainer.innerHTML = "";

  if (!premium) {
    const script1 = document.createElement("script");
    script1.innerHTML = `
      atOptions = {
        'key': 'd3f53565f5d79747627b0d392b1739d2',
        'format': 'iframe',
        'height': 50,
        'width': 320,
        'params': {}
      };`;
    const script2 = document.createElement("script");
    script2.src = "//www.highperformanceformat.com/d3f53565f5d79747627b0d392b1739d2/invoke.js";
    adContainer.appendChild(script1);
    adContainer.appendChild(script2);
  }
}

function subscribePremium() {
  const rzp = new Razorpay({
    key: "rzp_test_eo1T9nmNdxseLx",
    amount: 1000,
    currency: "INR",
    name: "Jay Premium",
    description: "Payment for premium access",
    handler: function (response) {
      alert("Payment successful: " + response.razorpay_payment_id);
      document.getElementById("premiumToggle").checked = true;
      togglePremium();
    },
    prefill: {
      name: "Jaykumar Mishra",
      email: "demo@example.com",
      contact: "9876543210"
    },
    theme: { color: "#3399cc" }
  });
  rzp.open();
}

async function detectCountryAndSetPrice() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    const currency = data.currency;
    let price = "";

    switch (currency) {
      case "INR": price = "₹10/month"; break;
      case "USD": price = "$0.15/month"; break;
      case "EUR": price = "€0.13/month"; break;
      default: price = `${currency} 0.20/month`; break;
    }

    document.getElementById("priceText").textContent = `Premium Price: ${price} (${data.country_name})`;
  } catch {
    document.getElementById("priceText").textContent = "Premium Price: $0.15/month";
  }
}

window.onload = () => {
  togglePremium();
  detectCountryAndSetPrice();
};