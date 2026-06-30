package at.lukas.projectdashboard.controller;

import at.lukas.projectdashboard.FileHelper;
import at.lukas.projectdashboard.GitManager;
import at.lukas.projectdashboard.data.TotalDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@RestController
@RequestMapping("/api")
public class ApiController
{
    private final GitManager gitManager;

    public ApiController(GitManager gitManager)
    {
        this.gitManager = gitManager;
    }

    @Value("${github.repo.path}")
    private String repopath;

    @Value("${git.repo.analizepath}")
    private String analisedir;


    @GetMapping({"/all-counts"})
    public TotalDto getAllFiles()
    {
        Path repoPath = Paths.get(repopath).resolve(analisedir);

        if (!Files.isDirectory(repoPath))
        {
            log.info("Repository path {} does not exist, updating repository", repoPath);
            gitManager.update();
        }

        if (!Files.isDirectory(repoPath))
        {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Configured analysis path does not exist: " + repoPath
            );
        }

        log.info("Received request");
        return FileHelper.getFiles(repoPath);
    }
}
