import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Avatar, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

const NewsCard = styled(Card)(({ theme, isMain }) => ({
  minHeight: '200px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  margin: '0 10px',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  transform: isMain ? 'scale(1)' : 'scale(0.85)',
  opacity: isMain ? 1 : 0.7,
  '&:hover': {
    transform: isMain ? 'scale(1.02)' : 'scale(0.9)',
    opacity: 1,
  },
}));

const CarouselContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  padding: '20px 0',
}));

const CarouselContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  padding: '0 40px',
  minHeight: '300px',
}));

const NavigationButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  zIndex: 2,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
}));

const PositivityMeter = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const StyledLinearProgress = styled(LinearProgress)(({ theme, rating }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    backgroundColor: rating >= 70 ? theme.palette.success.main :
                   rating >= 40 ? theme.palette.warning.main :
                   theme.palette.error.main,
  },
}));

const getSentimentIcon = (rating) => {
  if (rating >= 70) return <SentimentSatisfiedAltIcon color="success" />;
  if (rating >= 40) return <SentimentNeutralIcon color="warning" />;
  return <SentimentDissatisfiedIcon color="error" />;
};

const getSentimentText = (rating) => {
  if (rating >= 70) return 'Positive';
  if (rating >= 40) return 'Neutral';
  return 'Negative';
};

const SupplierNews = () => {
  const [news, setNews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Cypher query to get all Stire nodes, sorted by date, limited to 5 most recent
        const cypherQuery = `MATCH (s:Stire) RETURN s.id as id, s.date as date, s.name as name, s.rating as rating, s.link as link, s.icon as icon, s.source as source ORDER BY s.date DESC LIMIT 5`;

        const response = await fetch('http://localhost:8080/api/cypher/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: cypherQuery,
        });

        const data = await response.json();
        
        // Transform the data to match the expected format
        const transformedNews = data.map(item => ({
          id: item.id,
          date: item.date,
          title: item.name, // map 'name' to 'title' for compatibility
          rating: item.rating,
          link: item.link,
          icon: item.icon,
          source: item.source
        }));

        setNews(transformedNews);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchNews();
  }, []);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? news.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === news.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleNewsClick = (url) => {
    console.log('Clicked news with URL:', url);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!news.length) {
    return null;
  }

  const getNewsItem = (index) => {
    const adjustedIndex = (index + news.length) % news.length;
    return news[adjustedIndex];
  };

  const renderNewsCard = (index, isMain = false) => {
    const newsItem = getNewsItem(index);
    return (
      <NewsCard
        key={index}
        isMain={isMain}
        onClick={() => {
          console.log('News item clicked:', newsItem);
          handleNewsClick(newsItem.link);
        }}
        elevation={isMain ? 4 : 2}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={newsItem.icon}
              alt={newsItem.source}
              sx={{ width: 32, height: 32, mr: 1 }}
            />
            <Typography variant="subtitle2" color="text.secondary">
              {newsItem.source}
            </Typography>
          </Box>
          <Typography 
            variant={isMain ? "h5" : "h6"} 
            gutterBottom
            sx={{ 
              fontWeight: isMain ? 'bold' : 'normal',
              fontSize: isMain ? '1.25rem' : '1rem'
            }}
          >
            {newsItem.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(newsItem.date).toLocaleDateString()}
          </Typography>
          
          <PositivityMeter>
            {getSentimentIcon(newsItem.rating)}
            <Box sx={{ flexGrow: 1 }}>
              <StyledLinearProgress 
                variant="determinate" 
                value={newsItem.rating}
                rating={newsItem.rating}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {getSentimentText(newsItem.rating)}
            </Typography>
          </PositivityMeter>
        </CardContent>
      </NewsCard>
    );
  };

  return (
    <CarouselContainer>
      <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
        Latest Supplier News
      </Typography>
      <CarouselContent>
        <NavigationButton
          onClick={handlePrevious}
          sx={{ left: 0 }}
        >
          <ArrowBackIosNewIcon />
        </NavigationButton>
        
        {renderNewsCard(currentIndex - 1)}
        {renderNewsCard(currentIndex, true)}
        {renderNewsCard(currentIndex + 1)}

        <NavigationButton
          onClick={handleNext}
          sx={{ right: 0 }}
        >
          <ArrowForwardIosIcon />
        </NavigationButton>
      </CarouselContent>
    </CarouselContainer>
  );
};

export default SupplierNews; 