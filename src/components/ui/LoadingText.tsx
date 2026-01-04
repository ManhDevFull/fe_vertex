import React from 'react';
import styled from 'styled-components';

const LoaderText = () => {
  return (
    <StyledWrapper>
      <div className="loader">
        <p className="text" aria-live="polite" aria-busy="true">
          <span className="letter letter1">L</span>
          <span className="letter letter2">o</span>
          <span className="letter letter3">a</span>
          <span className="letter letter4">d</span>
          <span className="letter letter5">i</span>
          <span className="letter letter6">n</span>
          <span className="letter letter7">g</span>
          <span className="letter letter8">.</span>
          <span className="letter letter9">.</span>
          <span className="letter letter10">.</span>
        </p>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
 height: 40px;
  width: 100%;

  .text {
    color: black;
    font-weight: 600;
    font-size: 0.9rem;
    letter-spacing: 0.08em;
  }

  @keyframes letter {
    0% {
      transform: translateY(0);
    }

    50% {
      transform: translateY(-2px);
    }

    100% {
      transform: translateY(0);
    }
  }

  .letter {
    animation: letter 1s infinite;
    display: inline-block;
  }

  .letter1 {
    animation-delay: 0s;
  }

  .letter2 {
    animation-delay: -0.9s;
  }

  .letter3 {
    animation-delay: -0.8s;
  }

  .letter4 {
    animation-delay: -0.7s;
  }

  .letter5 {
    animation-delay: -0.6s;
  }

  .letter6 {
    animation-delay: -0.5s;
  }

  .letter7 {
    animation-delay: -0.4s;
  }

  .letter8 {
    animation-delay: -0.3s;
  }

  .letter9 {
    animation-delay: -0.2s;
  }

  .letter10 {
    animation-delay: -0.1s;
  }`;

export default LoaderText;
