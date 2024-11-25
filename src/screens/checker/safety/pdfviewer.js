import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import * as pdfjsLib from 'pdfjs-dist/webpack';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  overflow-y: auto; // 수직 스크롤 가능
  max-height: 500px; // 최대 높이 설정
  width: 100%; // 컨테이너 너비 100%
  border: 1px solid #ccc; // 경계선 추가 (선택적)
`;

const CanvasContainer = styled.div`
  width: 100%;
  margin-bottom: 20px; // 각 페이지 간격
  position: relative; // 캔버스의 상대적 위치 지정
`;

const Canvas = styled.canvas`
  width: 100%; // 캔버스 너비 100%로 설정
  height: auto; // 높이는 자동으로 조정
  display: block; // 블록 레벨 요소로 설정
`;

const PdfViewer = ({ url }) => {
  const containerRef = useRef(null);
  const [totalPages, setTotalPages] = useState(0);
  const [scale] = useState(1.5); // 기본 스케일 설정 (기본값보다 큰 값으로 설정)

  useEffect(() => {
    const loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(
      (loadedPdf) => {
        setTotalPages(loadedPdf.numPages);
        // 모든 페이지를 렌더링
        for (let i = 1; i <= loadedPdf.numPages; i++) {
          renderPage(i, loadedPdf);
        }
      },
      (reason) => {
        console.error(reason);
      }
    );
  }, [url]);

  const renderPage = (pageNum, pdf) => {
    pdf.getPage(pageNum).then((page) => {
      const viewport = page.getViewport({ scale: scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport,
      };
      page.render(renderContext);

      // 캔버스를 반응형으로 설정
      const canvasContainer = document.createElement('div');
      canvasContainer.style.width = '100%';

      canvasContainer.appendChild(canvas);
      containerRef.current.appendChild(canvasContainer);

      const resizeCanvas = () => {
        const scaleFactor = containerRef.current.clientWidth / viewport.width;
        canvas.style.width = `${viewport.width * scaleFactor}px`;
        canvas.style.height = `${viewport.height * scaleFactor}px`;
      };

      window.addEventListener('resize', resizeCanvas);
      resizeCanvas(); 
    });
  };

  return (
    <Container ref={containerRef}></Container>
  );
};

export default PdfViewer;
