package at.lukas.projectdashboard;

import lombok.extern.slf4j.Slf4j;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;

@Slf4j
@Service
public class GitManager
{
    @Value("${github.repo.url}")
    private String repoUrl;

    @Value("${github.repo.path}")
    private String repoPath;

    @Value("${github.token}")
    private String githubToken;

    UsernamePasswordCredentialsProvider credentials;

    public void update()
    {
        if (credentials == null)
        {
            log.info("Creating credentials");
            credentials = new UsernamePasswordCredentialsProvider(
                    "x-access-token",
                    githubToken
            );
        }
        log.info("Cloning repository");
        File repoDir = new File(repoPath);
        File gitDir = new File(repoDir, ".git");

        try {
            if (gitDir.exists()) {
                try (Git git = Git.open(repoDir)) {
                    git.pull()
                            .setCredentialsProvider(credentials)
                            .call();
                }
                log.info("Repository updated");
            } else {
                try (Git git = Git.cloneRepository()
                        .setURI(repoUrl)
                        .setDirectory(repoDir)
                        .setCredentialsProvider(credentials)
                        .call()) {
                }
                log.info("Repository cloned");
            }
        } catch (IOException | GitAPIException e) {
            log.error("Error while cloning/updating repository", e);
        }

    }
}
