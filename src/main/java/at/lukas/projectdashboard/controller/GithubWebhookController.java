package at.lukas.projectdashboard.controller;

import at.lukas.projectdashboard.GitManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@Slf4j
@RestController
@RequestMapping("/api/github")
public class GithubWebhookController
{
    @Autowired
    private GitManager updateService;


    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(
            @RequestHeader("X-GitHub-Event") String event,
            @RequestBody String payload
    ) {
        log.info("Received webhook: {}", event);
        if (!event.equals("push")) {
            return ResponseEntity.ok().build();
        }

        updateService.update();
        return ResponseEntity.accepted().build();
    }
}