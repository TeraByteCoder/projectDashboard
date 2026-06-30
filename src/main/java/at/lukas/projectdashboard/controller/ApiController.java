package at.lukas.projectdashboard.controller;
import at.lukas.projectdashboard.FileHelper;
import at.lukas.projectdashboard.data.TotalDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@RestController("/api")
public class ApiController
{
    @Value("${github.repo.path}")
    private String repopath;

    @Value("${git.repo.analizepath}")
    private String analisedir;



    @GetMapping("/all-counts")
    public TotalDto getAllFiles()
    {
        Path repoPath = Paths.get(repopath).resolve(analisedir);

        log.info("Received request");
        return FileHelper.getFiles(repoPath);
    }
}