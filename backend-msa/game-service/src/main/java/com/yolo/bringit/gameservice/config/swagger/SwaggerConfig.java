package com.yolo.bringit.gameservice.config.swagger;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {
    @Value("${swagger.server-url}")
    String swaggerUrl;

    @Bean
    public OpenAPI customOpenAPI() {
        // Security Scheme 정의
        SecurityScheme securityScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .in(SecurityScheme.In.HEADER)
                .name("Authorization");

        // Security Requirement 정의
        SecurityRequirement securityRequirement = new SecurityRequirement().addList("BearerAuth");

        return new OpenAPI()
                .info(new Info().title("Game Service API")
                        .description("Game Service API Documentation")
                        .version("v1.0"))
                .addSecurityItem(securityRequirement)  // Security Requirement 추가
                .schemaRequirement("BearerAuth", securityScheme)
                .servers(List.of(new Server().url(swaggerUrl)));
    }
}
