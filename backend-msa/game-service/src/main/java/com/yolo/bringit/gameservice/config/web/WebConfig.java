package com.yolo.bringit.gameservice.config.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    //@Value("${app.front.url}")
    //private String frontUrl;
    private final long MAX_AGE_SECS = 3600;
    private static final String[] RESOURCE_LOCATION = {
            "classpath:/static/"
    };

    // CORS 관련 설정
//    @Override
//    public void addCorsMappings(CorsRegistry registry) {
//        registry.addMapping("/**")
//                //.allowedOrigins(frontUrl)
//                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
//                .allowedHeaders("*")
//                .allowCredentials(false)
//                .maxAge(MAX_AGE_SECS);
//    }

    // 리소스 설정
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry
                .addResourceHandler("/**")
                .addResourceLocations(RESOURCE_LOCATION)
                .setCachePeriod(0)
                .resourceChain(true)
                .addResolver(new PathResourceResolver());
    }
}
