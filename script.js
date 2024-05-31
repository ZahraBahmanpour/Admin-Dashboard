const body = document.querySelector("body"),
  sidebar = body.querySelector("nav"),
  sidebarToggle = body.querySelector(".sidebar-toggle");

const dashboard = body.querySelector(".dashboard");

sidebarToggle.addEventListener("click", () => {
  sidebar.classList.toggle("close");
  dashboard.classList.toggle("open");
});

const BASE_URL = "http://localhost:4000";
const form = document.querySelector("form");
const controller = new AbortController();

const getActivities = async (queryString = "") => {
  try {
    document.querySelector(".loader").style.display = "block";
    const response = await fetch(
      `${BASE_URL}/activities?name=${queryString}&_page=1&_per_page=2`,
      {
        signal: controller.signal,
      }
    );
    if (response.status === 200) {
      const data = await response.json();
      const { data: activities } = data;
      document.querySelector(".activity-data tbody").innerHTML = activities
        .map(
          (activity) =>
            `<tr><td>${activity.name}</td><td>${activity.email}</td><td>${activity.joined}</td><td>${activity.type}</td><td>${activity.status}</td><td><i class="uil uil-edit" onclick="editActivity(${activity.id})"></i><i class="uil uil-trash" onclick="deleteActivity(${activity.id})"></i></td></tr>`
        )
        .join("");
    } else {
      throw new Error(`Server responded with error code ${response.status}`);
    }
  } catch (e) {
    console.log(e);
  } finally {
    document.querySelector(".loader").style.display = "none";
  }
};

getActivities();

const createActivity = (activity) => {
  // const formData = new FormData();
  // formData.append('image', file.files[0]);
  fetch(`${BASE_URL}/activities`, {
    method: "POST",
    body: JSON.stringify(activity),
    headers: { "Content-Type": "application/json" },
  });
};

const submitForm = (e) => {
  e.preventDefault();
  const activity = {
    name: form["name"].value,
    email: form["email"].value,
  };
  if (form["btn_submit"].dataset.id) {
    updateActivity({ ...activity, id: form["btn_submit"].dataset.id });
  } else {
    createActivity(activity);
  }
};
form.addEventListener("submit", submitForm);

const editActivity = (id) => {
  fetch(`${BASE_URL}/activities/${id}`)
    .then((res) => res.json())
    .then((activity) => {
      form["name"].value = activity.name;
      form["email"].value = activity.email;
      form["btn_submit"].dataset.id = activity.id;
    })
    .catch((e) => {
      console.log(e);
    });
};

const updateActivity = (activity) => {
  fetch(`${BASE_URL}/activities/${activity.id}`, {
    method: "PUT",
    body: JSON.stringify(activity),
  })
    .then((res) => res.json())
    .then((activity) => console.log(activity))
    .finally(() => {
      form["btn_submit"].dataset.id = "";
    });
};

const deleteActivity = (id) => {
  fetch(`${BASE_URL}/activities/${id}`, { method: "DELETE" });
};

document.getElementById("input_search").addEventListener("input", (e) => {
  getActivities(e.target.value);
});

document.getElementById("btn_cancel_request").addEventListener("click", () => {
  controller.abort();
});
