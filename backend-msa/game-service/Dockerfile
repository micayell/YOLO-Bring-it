FROM openjdk:17-ea-11-jdk-slim
VOLUME /tmp
COPY build/libs/game-service-1.0.jar GameService.jar
ENTRYPOINT ["java", "-jar", "GameService.jar"]