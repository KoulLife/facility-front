FROM node:18-alpine

# 작업 디렉토리를 설정 (컨테이너 내부 경로)
WORKDIR /usr/src/app

# package-lock.json을 복사 (의존성 설치를 위해)
COPY package-lock.json package.json ./

# 의존성 설치
RUN npm install

# 나머지 소스 코드 복사
COPY . .

# React 개발 서버가 사용하는 포트
EXPOSE 3000

# React 개발 서버 실행
CMD ["npm", "start"]
