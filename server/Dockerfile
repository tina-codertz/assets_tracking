#Use the official node.js image
FROM node:18-alpine

#set the working directory
WORKDIR /app

#copy package files first for better caching
COPY package*.json ./


#install dependencies
RUN npm install

#copy the rest of the app
COPY . .

#Expose the backend port
EXPOSE 3000

#start server
CMD ["npm", "start"]
