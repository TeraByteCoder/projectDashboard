package at.lukas.projectdashboard;


import at.lukas.projectdashboard.data.FileDto;
import at.lukas.projectdashboard.data.TotalDto;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.lang.reflect.Array;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;


public class FileHelper
{
    public static TotalDto getFiles(Path path)
    {
            ArrayList<FileDto> fileDtos = new ArrayList<>();

            try (Stream<Path> paths = Files.walk(path))
            {
                paths.filter(Files::isRegularFile)
                        .forEach(filePath ->
                        {
                            String filename = filePath.getFileName().toString();
                            String filepath = path.relativize(filePath).toString();
                            int lines = countLines(filePath);

                            fileDtos.add(new FileDto(filename, filepath, lines));
                        });
            }
            catch (IOException | UncheckedIOException e)
            {
                return null;
            }

        return new TotalDto(fileDtos);
        }

    private static int countLines(Path path)
    {
        try (Stream<String> lines = Files.lines(path))
        {
            return Math.toIntExact(lines.count());
        } catch (IOException e)
        {
            throw new UncheckedIOException(e);
        }
    }
}