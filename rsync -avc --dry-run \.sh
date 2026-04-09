rsync -avc --dry-run \
  --info=progress2 --stats \
  --exclude='~$*' --exclude='*.tmp' --exclude='*.bak' \
  --exclude='*.swp' --exclude='desktop.ini' --exclude='Thumbs.db' --exclude='.DS_Store' \
  "/mnt/media/Users/lydia/Documents/Pictures to Order 1125" \
  "/mnt/pinkdrive/My Drive/"


rsync -avc \
--info=progress2 --stats \
--exclude='~$' --exclude='.tmp' --exclude='.bak' \
--exclude='.swp' --exclude='desktop.ini' --exclude='Thumbs.db' --exclude='.DS_Store' \
--remove-source-files \
  "/mnt/media/Users/lydia/Downloads" \
  "/mnt/pinkdrive/My Drive/"

rsync -avc --dry-run \
  --exclude='~$*' --exclude='*.tmp' --exclude='*.bak' \
  --exclude='*.swp' --exclude='desktop.ini' --exclude='Thumbs.db' --exclude='.DS_Store' \
  "/mnt/pinkdrive/My Drive/Documents/Zoom/2020-08-13 10.11.16 Lydia Newton's Personal Meeting Room 7882133198 (1)/" \
  "/mnt/pinkdrive/My Drive/Documents/Zoom/2020-08-13 10.11.16 Lydia Newton's Personal Meeting Room 7882133198/"

#
awk '
  /^  [0-9]/ {
    sub(/^[[:space:]]*[0-9.]+[KMG]\s+/, "", $0)
    paths[NR] = $0
  }
  END {
    for (i = 1; i <= NR; i += 2) {
      src = paths[i+1]
      dst = paths[i]
      printf("rsync -avc --dry-run --ignore-existing \"%s/\" \"%s/\"\n", src, dst)
    }
  }
' matches.txt | bash

awk '
  /^[[:space:]]*[0-9.]+[KMG][[:space:]]+/ {
    line = $0
    sub(/^[[:space:]]*[0-9.]+[KMG][[:space:]]+/, "", line)
    paths[++n] = line
  }
  END {
    for (i = 1; i <= n; i += 2)
      printf "rsync -avc --remove-source-files \"%s/\" \"%s/\"\n", paths[i+1], paths[i]
  }
' matches.txt


awk '
  /^[[:space:]]*[0-9.]+[KMG][[:space:]]+/ {
    line = $0
    sub(/^[[:space:]]*[0-9.]+[KMG][[:space:]]+/, "", line)
    paths[++n] = line
  }
  END {
    if (n % 2 != 0) {
      print "ERROR: odd number of paths detected" > "/dev/stderr"
      exit 1
    }
    for (i = 1; i <= n; i += 2) {
      dst = paths[i]
      src = paths[i+1]
      printf "rsync -avc --remove-source-files --itemize-changes \"%s/\" \"%s/\"\n", src, dst
    }
  }
' matches.txt | bash





find "/mnt/pinkdrive/My Drive" -type d -name '* (1)' -empty -print
find "/mnt/pinkdrive/My Drive/" -type d -empty -delete

fdupes -r -nohidden "/mnt/pinkdrive/My Drive/Classroom"

du -sh * 2>/dev/null | sort -hr



ffmpeg -i IMG_7156.MOV -c copy -map 0 -segment_time 2125 -f segment IMG_7156_part_%02d.MOV


m4b-tool merge *.mp3 \
  --use-filenames-as-chapters \
  --cover cover.jpg \
  --name "Crown of Midnight" \
  --series "Throne of Glass" \
  --series-part 1 \
  --artist "Sarah J. Maas" \
  --albumartist "Sarah J. Maas" \
  --genre "Audiobook" \
  -o "Crown of Midnight.m4b"


  ffmpeg -i "Pokémon Concierge (2023) S01E02 What’s on Your Mind_ Psyduck_.MP4" -to 00:13:49 -c copy "Episode02.trimmed.mp4"
