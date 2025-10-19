package com.yolo.bringit.gameservice.config.scheduler;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

@Configuration
public class GameSchedulerConfig {

    @Bean(name = "gameTaskScheduler") // 이름을 구분해 충돌 회피
    public TaskScheduler gameTaskScheduler() {
        ThreadPoolTaskScheduler s = new ThreadPoolTaskScheduler();
        s.setPoolSize(2);
        s.setThreadNamePrefix("game-scheduler-");
        s.initialize();
        return s;
    }
}