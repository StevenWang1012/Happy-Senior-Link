// 樂齡智享 - 核心邏輯代碼 (視覺精緻版)
var supabase; 

(function() {
    // 您之前提供的金鑰與網址保持不變
    const SUPABASE_URL = 'https://zeffbuvdbytfkdeopcry.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplZmZidXZkYnl0ZmtkZW9wY3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMzI2MTUsImV4cCI6MjA4MTYwODYxNX0.Wv0EFCYfYmrYoud8KxVD6fOQtOnBaRM9FE4h66eTqkk';

    try {
        if (window.supabase && window.supabase.createClient) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        }
    } catch (e) { console.error('Supabase 初始化失敗:', e); }

    let currentCategory = 'all';

    document.addEventListener('DOMContentLoaded', () => {
        fetchPosts();
    });

    window.switchCategory = function(category) {
        currentCategory = category;
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        const buttons = document.querySelectorAll('.tab-btn');
        const map = { 'all': 0, 'local': 1, 'china': 2, 'health': 3 };
        if (buttons[map[category]]) buttons[map[category]].classList.add('active');
        fetchPosts();
    };

    async function fetchPosts() {
        const container = document.getElementById('feed-container');
        if (!supabase) return;

        renderSkeleton(container);

        try {
            let query = supabase.from('posts').select('*').order('created_at', { ascending: false });
            if (currentCategory !== 'all') query = query.eq('category', currentCategory);

            const { data, error } = await query;
            if (error) throw error;

            if (!data || data.length === 0) {
                container.innerHTML = `<div style="text-align:center; padding: 60px 20px; color:#999;">📭<br>暫無內容</div>`;
                return;
            }
            renderPosts(data);
        } catch (err) {
            container.innerHTML = `<div style="padding:40px; text-align:center; color:#E64134;">讀取失敗，請重新整理</div>`;
        }
    }

    function renderSkeleton(container) {
        const skeletonHTML = `
            <div class="skeleton-card">
                <div class="skeleton-image"></div>
                <div class="skeleton-content"><div class="skeleton-text title"></div><div class="skeleton-text line"></div></div>
            </div>`;
        container.innerHTML = skeletonHTML + skeletonHTML;
    }

    function renderPosts(posts) {
        const container = document.getElementById('feed-container');
        container.innerHTML = ''; 

        posts.forEach(post => {
            let optimizedImage = post.image_url;
            if (optimizedImage && optimizedImage.includes('cloudinary.com')) {
                optimizedImage = optimizedImage.replace('/upload/', '/upload/f_auto,q_auto,w_800/');
            }
            if (!optimizedImage) optimizedImage = 'https://placehold.co/600x800?text=樂齡智享';

            const card = document.createElement('article');
            card.className = 'post-card';
            
            let catName = '生活';
            let catClass = 'tag-local';
            if(post.category === 'local') { catName = '本地生活'; catClass = 'tag-local'; }
            if(post.category === 'china') { catName = '大陸漫遊'; catClass = 'tag-china'; }
            if(post.category === 'health') { catName = '健康養生'; catClass = 'tag-health'; }

            card.innerHTML = `
                <div class="card-image-container">
                    <img src="${optimizedImage}" class="post-image" loading="lazy" onerror="this.src='https://placehold.co/600x800?text=圖片載入中';">
                    <!-- 仿小紅書標籤 -->
                    <div class="post-category-tag ${catClass}">${catName}</div>
                </div>
                <div class="post-content">
                    <h2 class="post-title">${escapeHtml(post.title)}</h2>
                    <p class="post-desc">${escapeHtml(post.content)}</p>
                    <div class="post-footer">
                        <div class="author">
                            <div class="author-avatar">${post.author_name.charAt(0)}</div>
                            <span>${escapeHtml(post.author_name)}</span>
                        </div>
                        <div class="interactions">
                            <button class="like-btn" onclick="handleLike(this, ${post.id})">
                                <span class="heart">♡</span> ${post.likes || 0}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    window.handleLike = function(btn, id) {
        const heart = btn.querySelector('.heart');
        if (heart.innerText === '♡') { heart.innerText = '❤️'; heart.style.color = '#E64134'; btn.style.color = '#E64134';
        } else { heart.innerText = '♡'; heart.style.color = '#666'; btn.style.color = '#666'; }
    };

    function escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
})();