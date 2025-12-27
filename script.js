// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Tab functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Handle tab button clicks
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            if (targetTab) {
                switchTab(targetTab, this);
            }
        });
    });

    // Function to switch tabs
    function switchTab(targetTab, activeButton) {
        // Remove active class from all buttons and panes
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));

        // Add active class to clicked button and corresponding pane
        if (activeButton) {
            activeButton.classList.add('active');
        }
        const targetPane = document.getElementById(targetTab);
        if (targetPane) {
            targetPane.classList.add('active');
        }
    }

    // FAQ accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faqItem => {
                faqItem.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Smooth scrolling for anchor links (if needed)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Load YouTube videos
    loadYouTubeVideos();
    
    // Load Patreon blog post
    loadPatreonPost();
});

// YouTube video URLs
const youtubeVideos = [
    'https://www.youtube.com/watch?v=MG8POs0jwUQ',
    'https://www.youtube.com/watch?v=SkMjSF7C7r8',
    'https://www.youtube.com/watch?v=4ewrGvc6PqM&t=6s',
    'https://www.youtube.com/watch?v=Ij5hrTmfOgs'
];

// Extract video ID from YouTube URL
function getYouTubeVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Load YouTube videos with thumbnails and titles
async function loadYouTubeVideos() {
    const videoGrid = document.getElementById('video-grid');
    if (!videoGrid) return;

    for (const videoUrl of youtubeVideos) {
        const videoId = getYouTubeVideoId(videoUrl);
        if (!videoId) {
            console.error('Invalid YouTube URL:', videoUrl);
            continue;
        }

        try {
            // Fetch video title using YouTube oEmbed API
            const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
            const response = await fetch(oembedUrl);
            
            if (!response.ok) {
                throw new Error('Failed to fetch video info');
            }
            
            const data = await response.json();
            const title = data.title || 'YouTube Video';
            
            const videoCard = document.createElement('div');
            videoCard.className = 'video-card';
            videoCard.innerHTML = `
                <a href="${videoUrl}" target="_blank" class="video-link">
                    <div class="video-thumbnail">
                        <img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" 
                             alt="${escapeHtml(title)}" 
                             onerror="this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'">
                        <div class="play-overlay">
                            <span class="play-icon">▶</span>
                        </div>
                    </div>
                    <h3>${escapeHtml(title)}</h3>
                </a>
            `;
            videoGrid.appendChild(videoCard);
        } catch (error) {
            console.error('Error loading YouTube video:', videoUrl, error);
            // Fallback: create video card with just thumbnail and URL
            const videoCard = document.createElement('div');
            videoCard.className = 'video-card';
            videoCard.innerHTML = `
                <a href="${videoUrl}" target="_blank" class="video-link">
                    <div class="video-thumbnail">
                        <img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" 
                             alt="YouTube Video"
                             onerror="this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'">
                        <div class="play-overlay">
                            <span class="play-icon">▶</span>
                        </div>
                    </div>
                    <h3>YouTube Video</h3>
                </a>
            `;
            videoGrid.appendChild(videoCard);
        }
    }
}

// Load Patreon blog post
async function loadPatreonPost() {
    const blogList = document.getElementById('blog-list');
    if (!blogList) return;

    const patreonUrl = 'https://www.patreon.com/posts/bi-te-bi-li-lun-146765098?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=postshare_creator&utm_content=join_link';
    
    try {
        // Try to fetch using a CORS proxy (since Patreon doesn't allow direct CORS)
        // Note: Patreon posts may require authentication, so this might not always work
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(patreonUrl)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error('Failed to fetch Patreon post');
        }
        
        const data = await response.json();
        
        if (data.contents) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.contents, 'text/html');
            
            // Try multiple selectors to find the title
            let title = doc.querySelector('[property="og:title"]')?.getAttribute('content') ||
                       doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ||
                       doc.querySelector('h1')?.textContent?.trim() ||
                       doc.querySelector('title')?.textContent?.replace(/\s*\|\s*Patreon.*$/, '').trim() ||
                       'Patreon Post';
            
            // Try multiple selectors to find the content
            let content = doc.querySelector('[data-tag="post-content"]')?.textContent ||
                         doc.querySelector('.post-content')?.textContent ||
                         doc.querySelector('article')?.textContent ||
                         doc.querySelector('[class*="post"]')?.textContent ||
                         '';
            
            // Clean up content (remove extra whitespace)
            content = content.replace(/\s+/g, ' ').trim();
            
            // Get first 100 words
            const words = content.split(/\s+/).filter(word => word.length > 0);
            const first100Words = words.slice(0, 100).join(' ');
            
            // Only add ellipsis if there are more words
            const previewText = words.length > 100 ? first100Words + '...' : first100Words;
            
            const blogItem = document.createElement('article');
            blogItem.className = 'blog-item';
            blogItem.innerHTML = `
                <div class="blog-meta">
                    <span class="blog-category">Patreon</span>
                </div>
                <h3>${escapeHtml(title)}</h3>
                <p>${previewText || 'Click the link below to read the full post on Patreon.'}</p>
                <a href="${patreonUrl}" class="read-more" target="_blank">Read More →</a>
            `;
            
            // Insert at the beginning of the blog list
            blogList.insertBefore(blogItem, blogList.firstChild);
            return;
        }
    } catch (error) {
        console.error('Error loading Patreon post:', error);
    }
    
    // Fallback: create blog item with just the link
    const blogItem = document.createElement('article');
    blogItem.className = 'blog-item';
    blogItem.innerHTML = `
        <div class="blog-meta">
            <span class="blog-category">Patreon</span>
        </div>
        <h3>Patreon Post</h3>
        <p>Click the link below to read the full post on Patreon.</p>
        <a href="${patreonUrl}" class="read-more" target="_blank">Read More →</a>
    `;
    blogList.insertBefore(blogItem, blogList.firstChild);
}
