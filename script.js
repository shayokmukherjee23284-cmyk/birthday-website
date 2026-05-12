  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);
  const values = [
    ["Days", days],
    ["Hours", hours],
    ["Minutes", minutes],
    ["Seconds", seconds]
  ];

  countdown.innerHTML = values
    .map(([label, value]) => `<span><strong>${String(value).padStart(2, "0")}</strong>${label}</span>`)
    .join("");
}

updateCountdown();
setInterval(updateCountdown, 1000);

function canUseSupabase() {
  return SUPABASE_URL.startsWith("https://") && SUPABASE_ANON_KEY.length > 20 && window.supabase;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function renderWishes() {
  list.innerHTML = "";
  wishes
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .forEach((wish) => {
      const card = document.createElement("article");
      card.className = "glass wish-card";
      card.innerHTML = `
        <p></p>
        <time>${formatDate(wish.created_at)}</time>
      `;
      card.querySelector("p").textContent = wish.message;
      list.appendChild(card);
    });
}

function loadLocalWishes() {
  let saved = [];

  try {
    saved = JSON.parse(localStorage.getItem("nandika-wishes") || "[]");
  } catch {
    saved = [];
  }

  wishes = saved.length ? saved : sampleWishes;
  renderWishes();
  statusText.textContent =
    "Preview mode: add Supabase keys in script.js so every visitor can read the same wishes.";
}

async function loadSharedWishes() {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await supabaseClient
    .from("wishes")
    .select("message,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    loadLocalWishes();
    statusText.textContent = `Could not connect online: ${describeSupabaseError(error)}`;
    return;
  }

  wishes = data.length ? data : sampleWishes;
  renderWishes();
  statusText.textContent = "Online wishes are live. Everyone visiting can read wishes posted here.";

  supabaseClient
    .channel("wishes")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "wishes" }, (payload) => {
      wishes = [payload.new, ...wishes];
      renderWishes();
    })
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        statusText.textContent = "Online wishes are live. Everyone visiting can read wishes posted here.";
      }
    });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = input.value.trim();

  if (message.length < 3) {
    statusText.textContent = "Write a little more from the heart.";
    return;
  }

  const wish = {
    message,
    created_at: new Date().toISOString()
  };

  if (supabaseClient) {
    const { error } = await supabaseClient.from("wishes").insert({ message });
    if (error) {
      statusText.textContent = `Wish could not be posted: ${describeSupabaseError(error)}`;
      return;
    }
    wishes = [wish, ...wishes];
    renderWishes();
  } else {
    wishes = [wish, ...wishes.filter((item) => !sampleWishes.includes(item))];
    try {
      localStorage.setItem("nandika-wishes", JSON.stringify(wishes));
    } catch {
      statusText.textContent = "Wish posted for this page view. Browser storage is blocked.";
    }
    renderWishes();
  }

  input.value = "";
  statusText.textContent = "Your wish is posted.";
});

if (canUseSupabase()) {
  loadSharedWishes();
} else {
  loadLocalWishes();
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    statusText.textContent = "Online wishes are not connected yet. Add Supabase URL and anon key in config.js.";
  } else if (!window.supabase) {
    statusText.textContent = "Supabase library did not load. Check your internet connection or CDN access.";
  }
}

Latest turn
















