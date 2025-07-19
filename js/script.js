// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const button = document.querySelector('button');
const gallery = document.getElementById('gallery');

// NASA API configuration
const NASA_API_KEY = 'DEMO_KEY'; // Replace with your actual API key
const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';

// Space facts for random display
const spaceFacts = [
  "Did you know? A day on Venus is longer than its year!",
  "Did you know? Jupiter has 95 known moons, including four large ones discovered by Galileo!",
  "Did you know? Saturn's rings are made mostly of ice particles and rocky debris!",
  "Did you know? Mars has the largest volcano in the solar system - Olympus Mons!",
  "Did you know? The Sun contains 99.86% of the mass in our solar system!",
  "Did you know? Neutron stars are so dense that a teaspoon would weigh 6 billion tons!",
  "Did you know? The Milky Way galaxy contains over 100 billion stars!",
  "Did you know? Light from the Sun takes about 8 minutes and 20 seconds to reach Earth!",
  "Did you know? The International Space Station orbits Earth every 90 minutes!",
  "Did you know? One million Earths could fit inside the Sun!"
];

// Call the setupDateInputs function from dateRange.js
setupDateInputs(startInput, endInput);

// Display random space fact
function displayRandomSpaceFact() {
  const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
  const factElement = document.createElement('div');
  factElement.className = 'space-fact';
  factElement.innerHTML = `<p><strong>${randomFact}</strong></p>`;
  
  // Insert before gallery
  const container = document.querySelector('.container');
  const gallery = document.getElementById('gallery');
  container.insertBefore(factElement, gallery);
}

// Fetch NASA APOD data for date range
async function fetchAPODData(startDate, endDate) {
  try {
    const url = `${NASA_API_URL}?api_key=${NASA_API_KEY}&start_date=${startDate}&end_date=${endDate}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error('Error fetching APOD data:', error);
    throw error;
  }
}

// Show loading message
function showLoading() {
  gallery.innerHTML = `
    <div class="loading">
      <div class="loading-icon">🔄</div>
      <p>Loading space photos...</p>
    </div>
  `;
}

// Create gallery item HTML
function createGalleryItem(apodData) {
  const { title, date, url, media_type, explanation, thumbnail_url } = apodData;
  
  // Handle video entries
  if (media_type === 'video') {
    return `
      <div class="gallery-item video-item" data-explanation="${explanation.replace(/"/g, '&quot;')}" data-title="${title}" data-date="${date}">
        <div class="video-placeholder">
          <div class="video-icon">🎥</div>
          <p><strong>Video Content</strong></p>
        </div>
        <div class="item-info">
          <h3>${title}</h3>
          <p class="date">${new Date(date).toLocaleDateString()}</p>
          <a href="${url}" target="_blank" class="video-link">Watch Video</a>
        </div>
      </div>
    `;
  }
  
  // Handle image entries
  const imageUrl = thumbnail_url || url;
  return `
    <div class="gallery-item image-item" data-explanation="${explanation.replace(/"/g, '&quot;')}" data-title="${title}" data-date="${date}" data-url="${url}">
      <img src="${imageUrl}" alt="${title}" loading="lazy" />
      <div class="item-info">
        <h3>${title}</h3>
        <p class="date">${new Date(date).toLocaleDateString()}</p>
      </div>
    </div>
  `;
}

// Display gallery
function displayGallery(apodDataArray) {
  if (apodDataArray.length === 0) {
    gallery.innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">😔</div>
        <p>No space images found for the selected date range.</p>
      </div>
    `;
    return;
  }
  
  const galleryHTML = apodDataArray.map(createGalleryItem).join('');
  gallery.innerHTML = galleryHTML;
  
  // Add click event listeners for modal
  const imageItems = gallery.querySelectorAll('.image-item');
  imageItems.forEach(item => {
    item.addEventListener('click', () => openModal(item));
  });
}

// Create and show modal
function openModal(item) {
  const title = item.dataset.title;
  const date = item.dataset.date;
  const explanation = item.dataset.explanation;
  const imageUrl = item.dataset.url;
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <img src="${imageUrl}" alt="${title}" />
      <div class="modal-info">
        <h2>${title}</h2>
        <p class="modal-date">${new Date(date).toLocaleDateString()}</p>
        <p class="modal-explanation">${explanation}</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close modal functionality
  const closeBtn = modal.querySelector('.close');
  closeBtn.addEventListener('click', () => closeModal(modal));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });
  
  // Close on Escape key
  document.addEventListener('keydown', function escapeHandler(e) {
    if (e.key === 'Escape') {
      closeModal(modal);
      document.removeEventListener('keydown', escapeHandler);
    }
  });
}

// Close modal
function closeModal(modal) {
  modal.remove();
}

// Main function to get space images
async function getSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;
  
  if (!startDate || !endDate) {
    alert('Please select both start and end dates.');
    return;
  }
  
  if (new Date(startDate) > new Date(endDate)) {
    alert('Start date must be before or equal to end date.');
    return;
  }
  
  try {
    showLoading();
    const apodData = await fetchAPODData(startDate, endDate);
    displayGallery(apodData);
  } catch (error) {
    gallery.innerHTML = `
      <div class="placeholder error">
        <div class="placeholder-icon">❌</div>
        <p>Error loading space images. Please try again later.</p>
        <p class="error-details">${error.message}</p>
      </div>
    `;
  }
}

// Event listeners
button.addEventListener('click', getSpaceImages);

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  displayRandomSpaceFact();
});






