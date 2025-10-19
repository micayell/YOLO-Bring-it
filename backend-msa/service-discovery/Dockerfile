FROM openjdk:17-ea-11-jdk-slim
VOLUME /tmp
COPY build/libs/service-discovery-1.0.jar ServiceDiscovery.jar
ENTRYPOINT ["java","-jar","ServiceDiscovery.jar"]