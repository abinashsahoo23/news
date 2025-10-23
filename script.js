// Modern News Dashboard with Enhanced Sentiment Analysis
class NewsDashboard {
    constructor() {
        this.newsData = [];
        this.filteredNews = [];
        this.currentFilter = 'all';
        this.currentCategory = 'technology';
        this.apiKey = '22ce1de51bbb4b8b9197556c684cca9e'; // Keep for potential future use
        this.baseUrl = 'https://newsapi.org/v2/top-headlines'; // Keep for potential future use
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setCurrentDate();
        this.loadNews();
    }

    setCurrentDate() {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            dateElement.textContent = now.toLocaleDateString('en-US', options).toUpperCase();
        }
    }

    setupEventListeners() {
        // Newspaper filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveFilter(e.currentTarget);
                this.currentFilter = e.currentTarget.dataset.filter;
                this.filterNews();
            });
        });

        // Category select
        document.getElementById('categorySelect').addEventListener('change', (e) => {
            this.currentCategory = e.target.value;
            this.loadNews();
        });

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch(e.key) {
                    case '1':
                        document.querySelector('[data-filter="all"]').click();
                        break;
                    case '2':
                        document.querySelector('[data-filter="positive"]').click();
                        break;
                    case '3':
                        document.querySelector('[data-filter="neutral"]').click();
                        break;
                    case '4':
                        document.querySelector('[data-filter="negative"]').click();
                        break;
                }
            }
        });
    }

    setActiveFilter(activeBtn) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    async loadNews() {
        this.showLoading(true);
        
        try {
            let newsData;
            
            // Try to load real news from RSS feeds, fallback to mock data
            try {
                newsData = await this.fetchFromNewsAPI();
                this.showApiStatus('✅ Live news loaded successfully');
            } catch (error) {
                console.log('RSS feeds failed, using mock data');
                newsData = this.getMockNews();
                this.showApiStatus('📰 Using sample articles (RSS feeds unavailable)');
            }
            
            this.newsData = await this.analyzeSentiment(newsData);
            this.filteredNews = [...this.newsData];
            this.renderNews();
        } catch (error) {
            console.error('Error loading news:', error);
            // Show user-friendly error message
            this.showError('Unable to fetch latest news. Showing sample articles instead.');
            // Fallback to mock data if API fails
            const mockNews = this.getMockNews();
            this.newsData = await this.analyzeSentiment(mockNews);
            this.filteredNews = [...this.newsData];
            this.renderNews();
        } finally {
            this.showLoading(false);
        }
    }

    async fetchFromNewsAPI() {
        // Use RSS feeds that provide good summaries
        const rssFeeds = {
            'technology': [
                'https://feeds.feedburner.com/TechCrunch/',
                'https://feeds.feedburner.com/oreilly/radar',
                'https://feeds.feedburner.com/venturebeat/SZYF',
                'https://feeds.feedburner.com/arstechnica/'
            ],
            'business': [
                'https://feeds.feedburner.com/businessinsider',
                'https://feeds.feedburner.com/typepad/alleyinsider/silicon_alley_insider',
                'https://feeds.feedburner.com/venturebeat/SZYF',
                'https://feeds.feedburner.com/forbes/'
            ],
            'science': [
                'https://feeds.feedburner.com/sciencedaily',
                'https://feeds.feedburner.com/oreilly/radar',
                'https://feeds.feedburner.com/venturebeat/SZYF',
                'https://feeds.feedburner.com/nature/'
            ],
            'health': [
                'https://feeds.feedburner.com/WebMD',
                'https://feeds.feedburner.com/oreilly/radar',
                'https://feeds.feedburner.com/venturebeat/SZYF',
                'https://feeds.feedburner.com/healthline/'
            ],
            'sports': [
                'https://feeds.feedburner.com/espn/espn',
                'https://feeds.feedburner.com/oreilly/radar',
                'https://feeds.feedburner.com/venturebeat/SZYF',
                'https://feeds.feedburner.com/sportsillustrated/'
            ],
            'entertainment': [
                'https://feeds.feedburner.com/oreilly/radar',
                'https://feeds.feedburner.com/venturebeat/SZYF',
                'https://feeds.feedburner.com/TechCrunch/',
                'https://feeds.feedburner.com/entertainment/'
            ]
        };
        
        const feeds = rssFeeds[this.currentCategory] || rssFeeds['technology'];
        
        // Try to fetch from RSS feeds using CORS proxy
        for (let i = 0; i < feeds.length; i++) {
            try {
                console.log(`Trying RSS feed ${i + 1}...`);
                const proxyUrl = 'https://api.allorigins.win/raw?url=';
                const url = proxyUrl + encodeURIComponent(feeds[i]);
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`RSS feed ${i + 1} failed: ${response.status}`);
                }
                
                const xmlText = await response.text();
                const articles = this.parseRSSFeed(xmlText);
                
                if (articles.length > 0) {
                    console.log(`RSS feed ${i + 1} succeeded with ${articles.length} articles!`);
                    return articles;
                }
            } catch (error) {
                console.warn(`RSS feed ${i + 1} failed:`, error.message);
                if (i === feeds.length - 1) {
                    throw error; // Re-throw if all feeds failed
                }
            }
        }
    }
    
    parseRSSFeed(xmlText) {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            const items = xmlDoc.querySelectorAll('item');
            
            return Array.from(items).slice(0, 20).map(item => {
                const title = item.querySelector('title')?.textContent || 'No title';
                let description = item.querySelector('description')?.textContent || 
                                item.querySelector('summary')?.textContent || 
                                item.querySelector('content:encoded')?.textContent ||
                                'No description available';
                
                // Clean up the description
                description = description.replace(/<[^>]*>/g, ''); // Remove HTML tags
                description = description.replace(/&[^;]+;/g, ' '); // Remove HTML entities
                description = description.replace(/\s+/g, ' ').trim(); // Clean up whitespace
                
                // If description is too long or looks like full content, create a summary
                if (description.length > 300 || description.includes('Read more') || description.includes('Continue reading')) {
                    // Try to find the first sentence or two
                    const sentences = description.split(/[.!?]+/);
                    if (sentences.length > 1) {
                        description = sentences.slice(0, 2).join('.') + '.';
                    } else {
                        // Fallback: just take first 150 characters
                        description = description.substring(0, 150).trim();
                        if (description.length === 150) {
                            description += '...';
                        }
                    }
                }
                
                // Final length check - ensure it's not too long
                if (description.length > 200) {
                    description = description.substring(0, 200).trim();
                    // Try to end at a complete sentence
                    const lastPeriod = description.lastIndexOf('.');
                    if (lastPeriod > 100) {
                        description = description.substring(0, lastPeriod + 1);
                    } else {
                        description += '...';
                    }
                }
                
                const link = item.querySelector('link')?.textContent || '#';
                const pubDate = item.querySelector('pubDate')?.textContent || 
                              item.querySelector('published')?.textContent || 
                              new Date().toISOString();
                const source = item.querySelector('source')?.textContent || 
                             item.querySelector('author')?.textContent || 
                             'RSS Feed';
                
                return {
                    title: title,
                    description: description,
                    source: source,
                    publishedAt: pubDate,
                    url: link,
                    urlToImage: null
                };
            });
        } catch (error) {
            console.error('Error parsing RSS feed:', error);
            return [];
        }
    }


    getMockNews() {
        const categories = {
            technology: [
                {
                    title: "Breakthrough in Renewable Energy Storage Technology",
                    description: "Scientists develop new battery technology that could revolutionize clean energy storage, promising longer-lasting and more efficient solutions.",
                    source: "Tech News",
                    publishedAt: new Date().toISOString(),
                    url: "#"
                },
                {
                    title: "AI Breakthrough Promises Better Healthcare Outcomes",
                    description: "Machine learning algorithms achieve 95% accuracy in early disease detection, potentially saving millions of lives through preventive care.",
                    source: "Health Tech",
                    publishedAt: new Date(Date.now() - 10800000).toISOString(),
                    url: "#"
                },
                {
                    title: "Tech Layoffs Continue as Companies Restructure",
                    description: "Major technology companies announce additional job cuts as they adjust to changing market conditions and economic pressures.",
                    source: "Tech Industry",
                    publishedAt: new Date(Date.now() - 14400000).toISOString(),
                    url: "#"
                },
                {
                    title: "New Smartphone Innovation Revolutionizes Mobile Photography",
                    description: "Latest smartphone camera technology delivers professional-quality photos with advanced AI processing and enhanced low-light performance.",
                    source: "Mobile Tech",
                    publishedAt: new Date(Date.now() - 21600000).toISOString(),
                    url: "#"
                }
            ],
            business: [
                {
                    title: "Global Economic Markets Show Mixed Signals",
                    description: "Financial markets experience volatility as investors react to changing economic indicators and policy announcements.",
                    source: "Business Daily",
                    publishedAt: new Date(Date.now() - 3600000).toISOString(),
                    url: "#"
                },
                {
                    title: "Startup Secures Record-Breaking Investment Funding",
                    description: "Innovative fintech startup raises $500 million in Series C funding, marking the largest investment in the sector this year.",
                    source: "Finance Today",
                    publishedAt: new Date(Date.now() - 25200000).toISOString(),
                    url: "#"
                },
                {
                    title: "Major Retail Chain Announces Store Closures",
                    description: "Popular retail chain announces plans to close 200 stores nationwide due to declining sales and increased online competition.",
                    source: "Retail News",
                    publishedAt: new Date(Date.now() - 28800000).toISOString(),
                    url: "#"
                }
            ],
            science: [
                {
                    title: "Climate Change Report Warns of Accelerating Crisis",
                    description: "New research indicates that climate change impacts are occurring faster than previously predicted, with severe consequences for global ecosystems.",
                    source: "Science Today",
                    publishedAt: new Date(Date.now() - 7200000).toISOString(),
                    url: "#"
                },
                {
                    title: "Space Exploration Mission Achieves Historic Milestone",
                    description: "International space mission successfully completes first phase of Mars exploration, opening new possibilities for interplanetary research.",
                    source: "Space News",
                    publishedAt: new Date(Date.now() - 18000000).toISOString(),
                    url: "#"
                },
                {
                    title: "Revolutionary Cancer Treatment Shows Promising Results",
                    description: "New immunotherapy treatment achieves 80% success rate in clinical trials, offering hope for patients with previously untreatable cancers.",
                    source: "Medical Research",
                    publishedAt: new Date(Date.now() - 32400000).toISOString(),
                    url: "#"
                }
            ],
            health: [
                {
                    title: "Mental Health Awareness Campaign Reaches Millions",
                    description: "National mental health initiative successfully connects with over 10 million people, providing resources and support for those in need.",
                    source: "Health Weekly",
                    publishedAt: new Date(Date.now() - 36000000).toISOString(),
                    url: "#"
                },
                {
                    title: "New Vaccine Development Faces Regulatory Challenges",
                    description: "Pharmaceutical company encounters unexpected delays in vaccine approval process, raising concerns about timeline for public distribution.",
                    source: "Medical News",
                    publishedAt: new Date(Date.now() - 39600000).toISOString(),
                    url: "#"
                }
            ],
            sports: [
                {
                    title: "Olympic Athletes Break Multiple World Records",
                    description: "International sporting event concludes with athletes setting new world records in swimming, track, and gymnastics competitions.",
                    source: "Sports Daily",
                    publishedAt: new Date(Date.now() - 43200000).toISOString(),
                    url: "#"
                },
                {
                    title: "Professional League Faces Player Safety Concerns",
                    description: "Recent studies reveal increased risk of long-term health issues among professional athletes, prompting calls for rule changes.",
                    source: "Athletic News",
                    publishedAt: new Date(Date.now() - 46800000).toISOString(),
                    url: "#"
                }
            ],
            entertainment: [
                {
                    title: "Blockbuster Movie Breaks Box Office Records",
                    description: "Latest superhero film surpasses all previous records, becoming the highest-grossing movie of all time with global success.",
                    source: "Entertainment Weekly",
                    publishedAt: new Date(Date.now() - 50400000).toISOString(),
                    url: "#"
                },
                {
                    title: "Streaming Platform Faces Content Controversy",
                    description: "Popular streaming service receives criticism for content moderation policies, with creators and viewers expressing concerns about censorship.",
                    source: "Media News",
                    publishedAt: new Date(Date.now() - 54000000).toISOString(),
                    url: "#"
                }
            ]
        };

        return categories[this.currentCategory] || categories.technology;
    }

    async analyzeSentiment(newsItems) {
        // Enhanced sentiment analysis with weighted scoring
        const positiveWords = {
            'breakthrough': 3, 'success': 3, 'achieve': 2, 'improve': 2, 'better': 2, 
            'best': 3, 'excellent': 3, 'amazing': 3, 'wonderful': 3, 'great': 2, 
            'good': 1, 'positive': 2, 'win': 2, 'victory': 3, 'progress': 2,
            'innovation': 2, 'revolutionary': 3, 'promising': 2, 'saving': 3, 
            'successful': 2, 'historic': 2, 'record': 1, 'growth': 1, 'increase': 1,
            'advance': 2, 'develop': 1, 'create': 1, 'build': 1, 'expand': 1,
            'surge': 1, 'rise': 1, 'boost': 2, 'enhance': 2, 'optimize': 1
        };
        
        const negativeWords = {
            'crisis': 3, 'warning': 2, 'problem': 2, 'issue': 2, 'concern': 2, 
            'threat': 3, 'danger': 3, 'risk': 2, 'failure': 3, 'decline': 2, 
            'drop': 2, 'fall': 2, 'crash': 3, 'disaster': 3, 'tragedy': 3, 
            'negative': 2, 'layoffs': 2, 'cuts': 2, 'pressure': 1, 'volatility': 1, 
            'accelerating': 1, 'severe': 2, 'worse': 2, 'worst': 3, 'terrible': 3,
            'awful': 3, 'bad': 1, 'poor': 1, 'struggle': 2, 'challenge': 1,
            'difficult': 1, 'hard': 1, 'tough': 1, 'loss': 2, 'decrease': 1,
            'reduce': 1, 'cut': 1, 'eliminate': 2, 'remove': 1, 'destroy': 3
        };

        return newsItems.map(item => {
            const text = (item.title + ' ' + item.description).toLowerCase();
            
            let positiveScore = 0;
            let negativeScore = 0;
            
            // Calculate weighted scores
            Object.entries(positiveWords).forEach(([word, weight]) => {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                const matches = text.match(regex);
                if (matches) {
                    positiveScore += matches.length * weight;
                }
            });
            
            Object.entries(negativeWords).forEach(([word, weight]) => {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                const matches = text.match(regex);
                if (matches) {
                    negativeScore += matches.length * weight;
                }
            });

            // Determine sentiment with confidence threshold
            const confidence = Math.abs(positiveScore - negativeScore);
            let sentiment = 'neutral';
            let icon = '😐';
            
            if (confidence >= 2) { // Minimum confidence threshold
                if (positiveScore > negativeScore) {
                    sentiment = 'positive';
                    icon = '😊';
                } else if (negativeScore > positiveScore) {
                    sentiment = 'negative';
                    icon = '😞';
                }
            }

            return {
                ...item,
                sentiment,
                sentimentIcon: icon,
                positiveScore,
                negativeScore,
                confidence
            };
        });
    }


    filterNews() {
        if (this.currentFilter === 'all') {
            this.filteredNews = [...this.newsData];
        } else {
            this.filteredNews = this.newsData.filter(item => 
                item.sentiment === this.currentFilter
            );
        }
        
        this.renderNews();
    }

    renderNews() {
        const newsGrid = document.getElementById('newsGrid');
        const noNews = document.getElementById('noNews');
        
        if (this.filteredNews.length === 0) {
            newsGrid.style.display = 'none';
            noNews.style.display = 'block';
            return;
        }
        
        newsGrid.style.display = 'grid';
        noNews.style.display = 'none';
        
        newsGrid.innerHTML = this.filteredNews.map((article, index) => `
            <article class="news-article ${article.sentiment}">
                <div class="sentiment-indicator">${article.sentimentIcon}</div>
                <h2 class="article-headline">${article.title}</h2>
                <p class="article-summary">${article.description}</p>
                <div class="article-meta">
                    <span class="article-source">${article.source}</span>
                    <span class="article-date">${this.formatDate(article.publishedAt)}</span>
                </div>
            </article>
        `).join('');

        // Add click handlers for news articles
        document.querySelectorAll('.news-article').forEach((article, index) => {
            article.addEventListener('click', () => {
                const newsItem = this.filteredNews[index];
                if (newsItem.url && newsItem.url !== '#') {
                    window.open(newsItem.url, '_blank');
                }
            });
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays}d ago`;
        }
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        const newsGrid = document.getElementById('newsGrid');
        
        if (show) {
            loading.style.display = 'block';
            newsGrid.style.display = 'none';
        } else {
            loading.style.display = 'none';
        }
    }

    showError(message) {
        const newsGrid = document.getElementById('newsGrid');
        newsGrid.innerHTML = `
            <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: white;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.7;"></i>
                <h3>${message}</h3>
            </div>
        `;
    }

    showApiStatus(message) {
        // Create or update status notification
        let statusDiv = document.getElementById('apiStatus');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'apiStatus';
            statusDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--aged-paper-dark);
                border: 2px solid var(--border-brown);
                padding: 10px 15px;
                border-radius: 4px;
                font-family: var(--font-mono);
                font-size: 0.8rem;
                font-weight: 700;
                color: var(--ink-black);
                text-transform: uppercase;
                letter-spacing: 0.1em;
                z-index: 1000;
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                transition: all 0.3s ease;
            `;
            document.body.appendChild(statusDiv);
        }
        
        statusDiv.textContent = message;
        statusDiv.style.opacity = '1';
        statusDiv.style.transform = 'translateX(0)';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            statusDiv.style.opacity = '0';
            statusDiv.style.transform = 'translateX(100%)';
        }, 3000);
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NewsDashboard();
});

// Add some interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scrolling for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add keyboard navigation for filters
    document.addEventListener('keydown', (e) => {
        if (e.altKey) {
            switch(e.key) {
                case '1':
                    document.querySelector('[data-filter="all"]').click();
                    break;
                case '2':
                    document.querySelector('[data-filter="positive"]').click();
                    break;
                case '3':
                    document.querySelector('[data-filter="neutral"]').click();
                    break;
                case '4':
                    document.querySelector('[data-filter="negative"]').click();
                    break;
            }
        }
    });
});
