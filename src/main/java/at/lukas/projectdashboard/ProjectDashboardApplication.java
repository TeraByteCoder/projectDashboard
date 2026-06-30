package at.lukas.projectdashboard;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
@Slf4j
@SpringBootApplication
public class ProjectDashboardApplication {

    public static void main(String[] args) {
        log.info("Starting Application");
        SpringApplication.run(ProjectDashboardApplication.class, args);
    }

}
