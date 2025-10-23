# 📰 News Dashboard

A modern, responsive news dashboard that combines real-time news with AI-powered sentiment analysis. Filter news by emotional tone to control your information consumption and avoid doomscrolling.

## ✨ Features

- **Real-time News**: Fetch latest headlines from multiple categories
- **AI Sentiment Analysis**: Automatically analyze and tag news with sentiment (😊 Positive, 😐 Neutral, 😞 Negative)
- **Smart Filtering**: Filter news by emotional tone to control your information diet
- **Responsive Design**: Beautiful, mobile-first design that works on all devices
- **Category Selection**: Choose from Technology, Business, Science, Health, Sports, and Entertainment
- **Modern UI**: Clean, intuitive interface with smooth animations

## 🚀 Getting Started

### Prerequisites

- A modern web browser
- Internet connection for news API access

### Installation

1. Clone or download this repository
2. Open `index.html` in your web browser
3. For production use, you'll need a NewsAPI key (free at [newsapi.org](https://newsapi.org))

### API Setup

1. Get a free API key from [NewsAPI](https://newsapi.org)
2. Replace `YOUR_NEWS_API_KEY` in `script.js` with your actual API key
3. Update the API endpoint if needed

## 🎯 How It Works

### Sentiment Analysis
The dashboard uses a keyword-based sentiment analysis approach:
- **Positive words**: breakthrough, success, achieve, improve, etc.
- **Negative words**: crisis, warning, problem, issue, etc.
- **Neutral**: When positive and negative scores are equal

### Filtering System
- **All News**: Shows all articles regardless of sentiment
- **Positive**: Only shows articles with positive sentiment
- **Neutral**: Only shows articles with neutral sentiment  
- **Negative**: Only shows articles with negative sentiment

## 🛠️ Technical Details

### Built With
- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with Flexbox and Grid
- **Vanilla JavaScript**: No frameworks, pure JS for performance
- **NewsAPI**: Free news aggregation service
- **Font Awesome**: Icons for UI elements

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📱 Responsive Design

The dashboard is fully responsive with breakpoints for:
- **Desktop**: Full grid layout with multiple columns
- **Tablet**: Adjusted grid with 2 columns
- **Mobile**: Single column layout with optimized touch targets

## 🎨 Customization

### Colors
The color scheme can be easily customized by modifying CSS variables:
```css
:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --positive-color: #28a745;
    --neutral-color: #ffc107;
    --negative-color: #dc3545;
}
```

### Sentiment Analysis
To improve sentiment analysis, you can:
1. Add more keywords to the positive/negative word arrays
2. Integrate with more sophisticated NLP libraries
3. Use machine learning models for better accuracy

## 🔧 Development

### File Structure
```
news-dashboard/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # JavaScript functionality
└── README.md           # This file
```

### Adding New Features
1. **New Categories**: Add options to the category select in HTML
2. **Additional Filters**: Extend the filter system in JavaScript
3. **Custom Styling**: Modify CSS for different themes

## 📊 Performance

- **Lightweight**: No external dependencies except for icons
- **Fast Loading**: Optimized CSS and JavaScript
- **Efficient**: Minimal API calls with smart caching
- **Accessible**: WCAG compliant design patterns

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [NewsAPI](https://newsapi.org) for providing free news data
- [Font Awesome](https://fontawesome.com) for beautiful icons
- [Google Fonts](https://fonts.google.com) for the Inter font family

## 📞 Support

If you encounter any issues or have questions:
1. Check the browser console for errors
2. Ensure you have a valid NewsAPI key
3. Verify your internet connection
4. Try refreshing the page

---

**Happy News Reading! 📰✨**
