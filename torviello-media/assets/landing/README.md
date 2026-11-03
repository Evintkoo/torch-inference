# torviello-media/assets/landing

Photographic assets for the landing showcase cards (tickets 0038/0039).
Owned by this unit; `torviello-landing/web` imports them through the
`@torviello/media` alias (GOV-12.07 pattern: import from the owning unit,
never copy).

Delivered files (2026-10-25; re-cropped for the three-card row on ticket 0040):

- `builders.jpg` — for-builders card: person coding at a laptop at night under
  warm orange ambient light, dark dashboard on screen. 776×346.
- `teams.jpg` — for-AI-teams card: small team collaborating around a laptop in
  warm indoor light. 472×484.
- `city.jpg` — for-real-world-AI card: dark blue dusk cityscape with the
  orange inference line. 676×356.

## Provenance

Sliced from the project's approved brand board,
`torviello-design/brand/reference-board.png` (the showcase row), with
ImageMagick: cropped to text-free photo regions, Lanczos-upscaled 2×, stripped
of metadata, progressive JPEG quality 88. Not stock photography and not
generated media — the assets are derived from the project's own approved
design board, so there are no third-party license constraints.

Reproduction (from the repository root):

```sh
B=torviello-design/brand/reference-board.png
magick "$B" -crop 388x173+16+839 +repage -filter Lanczos -resize 776x346 \
  -strip -interlace Plane -quality 88 torviello-media/assets/landing/builders.jpg
magick "$B" -crop 236x242+630+770 +repage -filter Lanczos -resize 472x484 \
  -strip -interlace Plane -quality 88 torviello-media/assets/landing/teams.jpg
magick "$B" -crop 338x178+880+834 +repage -filter Lanczos -resize 676x356 \
  -strip -interlace Plane -quality 88 torviello-media/assets/landing/city.jpg
```

Decorative on the page (rendered `aria-hidden` behind a text scrim). Delivered
assets are evidence in the showcase-photography evaluation report at
`torviello-landing/evaluations/reports/2026-10-25-landing-showcase-photos.md`
and the re-composition report at
`torviello-landing/evaluations/reports/2026-10-25-landing-recomposition.md`.
