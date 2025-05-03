# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# 复制 package.json 和 yarn.lock
COPY package.json yarn.lock ./

# 安装依赖
RUN yarn install

# 复制全部代码
COPY . .

ENV NODE_ENV=production
RUN yarn build

# Production stage
FROM nginx:alpine

# 拷贝构建产物
COPY --from=build /app/build /usr/share/nginx/html

# nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]