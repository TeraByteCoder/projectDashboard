package at.lukas.projectdashboard.data;

public record FileDto(
        String filename,
        String filepath,
        int lines
){}
