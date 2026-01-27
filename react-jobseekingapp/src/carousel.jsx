import { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import img1 from './assets/slide1.jpg';
import img2 from './assets/slide2.jpg';
import img3 from './assets/slide3.jpg';
import "./carousel.css"


function ControlledCarousel() {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  return (
    <Carousel activeIndex={index} onSelect={handleSelect} style={{marginTop:'5px'}}>
      <Carousel.Item>
        
          <img className="w-100 image-box"
           src={img1} 
           alt='Failed to Load'></img>
        <Carousel.Caption>
          <h3>Your Career Journey Starts Here</h3>
          <p>Explore thousands of verified job opportunities from top companies — all in one place</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        
          <img className="image-box w-100"
           src={img2} 
           alt='Failed to Load'></img>
        <Carousel.Caption>
          <h3>Find Opportunities That Match Your Skills</h3>
          <p>Turn your skills, passion, and ambition into a successful career path</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        
          <img className="image-box w-100"
           src={img3} 
           alt='Failed to Load'></img>
        <Carousel.Caption>
          <h3>Work From Anywhere</h3>
          <p>
            Discover remote opportunities that let you work comfortably from home
          </p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
}

export default ControlledCarousel;