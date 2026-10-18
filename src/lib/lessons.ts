// Lektionen: kurze Erklärung + Übungsaufgaben zum passenden Lichess-Thema
import { lang } from '../i18n';

export interface Lesson {
  id: string;
  group: string;
  title: string;
  /** Lichess-Puzzle-Thema für die Übungen */
  theme: string;
  level: 'Einsteiger' | 'Fortgeschritten' | 'Erfahren';
  summary: string;
  body: string;
}

export interface Drill {
  id: string;
  title: string;
  summary: string;
  fen: string;
  goal: string;
}

export const LESSON_TARGET = 5;

export const LESSON_GROUPS = ['Taktische Motive', 'Mattbilder', 'Angriff & Verteidigung', 'Endspiele'] as const;

export const LESSONS: Lesson[] = [
  // ---------- Taktische Motive ----------
  {
    id: 'hanging', group: 'Taktische Motive', title: 'Hängende Figuren', theme: 'hangingPiece', level: 'Einsteiger',
    summary: 'Ungedeckte Figuren erkennen – und kostenlos einsammeln.',
    body: `Eine Figur **hängt**, wenn sie angegriffen und nicht (ausreichend) gedeckt ist. Die meisten Partien unter 1200 werden genau so entschieden.

**So gehst du vor**
- Frage dich vor jedem Zug: *Was hat sich durch den letzten gegnerischen Zug verändert?*
- Zähle Angreifer und Verteidiger: mehr Angreifer als Verteidiger = Material gewinnen.
- Prüfe auch umgekehrt, ob **deine** Figuren nach deinem Zug noch gedeckt sind.`,
  },
  {
    id: 'fork', group: 'Taktische Motive', title: 'Die Gabel', theme: 'fork', level: 'Einsteiger',
    summary: 'Eine Figur greift zwei Ziele gleichzeitig an.',
    body: `Bei einer **Gabel** greift eine Figur zwei (oder mehr) gegnerische Figuren gleichzeitig an. Der Gegner kann nur eine retten.

**Typisch**
- **Springergabeln** sind am gefährlichsten, weil der Springer nicht blockiert werden kann – besonders Schach + Dame.
- Bauern gabeln oft zwei Leichtfiguren (z. B. e4–e5 gegen Springer und Läufer).
- Die Dame gabelt gern mit Schach und gleichzeitigem Angriff auf eine ungedeckte Figur.

**Tipp:** Suche Felder, von denen aus du König und Dame (oder zwei ungedeckte Figuren) gleichzeitig erreichst.`,
  },
  {
    id: 'pin', group: 'Taktische Motive', title: 'Die Fesselung', theme: 'pin', level: 'Einsteiger',
    summary: 'Eine Figur darf nicht ziehen, weil dahinter etwas Wertvolleres steht.',
    body: `Bei einer **Fesselung** greift eine Langschrittler-Figur (Läufer, Turm, Dame) eine Figur an, hinter der eine wertvollere steht.

- **Absolute Fesselung:** dahinter steht der König – die Figur darf gar nicht ziehen.
- **Relative Fesselung:** dahinter steht z. B. die Dame – ziehen wäre teuer.

**So nutzt du sie aus:** Greife die gefesselte Figur ein weiteres Mal an (oft mit einem Bauern). Sie kann nicht ausweichen.`,
  },
  {
    id: 'skewer', group: 'Taktische Motive', title: 'Der Spieß', theme: 'skewer', level: 'Fortgeschritten',
    summary: 'Die umgekehrte Fesselung: die wertvolle Figur steht vorne.',
    body: `Beim **Spieß** steht die wertvollere Figur **vorne**. Sie muss ausweichen – und die Figur dahinter geht verloren.

- Klassiker: Läufer- oder Turmschach, König weicht aus, die Dame dahinter fällt.
- Besonders häufig im Endspiel mit Türmen und bei Königen und Damen auf derselben Linie.

**Tipp:** Achte darauf, wenn König und Dame (oder König und Turm) auf einer Linie oder Diagonale stehen.`,
  },
  {
    id: 'discovered', group: 'Taktische Motive', title: 'Abzugsangriff', theme: 'discoveredAttack', level: 'Fortgeschritten',
    summary: 'Eine Figur zieht weg und öffnet die Linie einer anderen.',
    body: `Beim **Abzugsangriff** zieht eine Figur weg und gibt dabei die Linie einer dahinterstehenden Figur frei. So entstehen **zwei Drohungen mit einem Zug**.

- Am stärksten als **Abzugsschach**: Die abziehende Figur kann fast alles schlagen, weil der Gegner erst das Schach abwehren muss.
- Suche Figuren, die sich gegenseitig auf einer Linie „verdecken“.`,
  },
  {
    id: 'doublecheck', group: 'Taktische Motive', title: 'Doppelschach', theme: 'doubleCheck', level: 'Erfahren',
    summary: 'Zwei Schachs gleichzeitig – nur der König kann ziehen.',
    body: `Ein **Doppelschach** entsteht durch einen Abzug, bei dem auch die abziehende Figur Schach gibt.

- Es kann weder geschlagen noch blockiert werden – **nur ein Königszug** hilft.
- Deshalb funktionieren Doppelschachs oft sogar, wenn die ziehende Figur ungedeckt ist oder hängt.
- Häufig der Auftakt zu Mattangriffen.`,
  },
  {
    id: 'deflection', group: 'Taktische Motive', title: 'Ablenkung', theme: 'deflection', level: 'Fortgeschritten',
    summary: 'Einen Verteidiger von seiner Aufgabe weglocken.',
    body: `Bei der **Ablenkung** zwingst du eine gegnerische Figur, ihren Posten zu verlassen – meist durch ein Schlagangebot oder Schach.

- Frage dich: *Welche gegnerische Figur hält gerade alles zusammen?* (Deckt sie ein Mattfeld, eine andere Figur, ein Umwandlungsfeld?)
- Diese Figur ist **überlastet**, wenn sie zwei Aufgaben gleichzeitig hat – dann reicht oft ein Opfer.`,
  },
  {
    id: 'attraction', group: 'Taktische Motive', title: 'Hinlenkung', theme: 'attraction', level: 'Erfahren',
    summary: 'Eine Figur (oft den König) auf ein ungünstiges Feld locken.',
    body: `Bei der **Hinlenkung** lockst du eine gegnerische Figur – meist den König – mit einem Opfer auf ein Feld, auf dem eine Taktik möglich wird (Gabel, Spieß, Matt).

**Muster:** Opfer auf f7/f2 oder h7/h2, König schlägt, danach folgt eine Springergabel oder ein Mattnetz.`,
  },
  {
    id: 'defender', group: 'Taktische Motive', title: 'Verteidiger beseitigen', theme: 'capturingDefender', level: 'Fortgeschritten',
    summary: 'Erst den Wächter schlagen, dann das Ziel.',
    body: `Wenn eine Figur nur von **einer** anderen gedeckt wird, schlage (oder tausche) den Verteidiger – dann hängt das eigentliche Ziel.

- Häufig: Läufer schlägt den Springer, der das Mattfeld h7 oder eine Dame deckt.
- Zähle dafür immer, **wer was deckt**.`,
  },
  {
    id: 'trapped', group: 'Taktische Motive', title: 'Gefangene Figuren', theme: 'trappedPiece', level: 'Fortgeschritten',
    summary: 'Figuren ohne Rückzugsfelder fangen.',
    body: `Eine Figur ist **gefangen**, wenn sie angegriffen wird und alle Fluchtfelder fehlen oder gedeckt sind.

- Typisch: Läufer auf a7/h7 nach Bauernraub (…b6 fängt ihn), Springer am Rand, die Dame tief im gegnerischen Lager.
- Merke: *Ein Springer am Rand bringt Kummer und Schand.*`,
  },
  {
    id: 'intermezzo', group: 'Taktische Motive', title: 'Zwischenzug', theme: 'intermezzo', level: 'Erfahren',
    summary: 'Nicht sofort zurückschlagen – erst eine stärkere Drohung.',
    body: `Ein **Zwischenzug** ist ein unerwarteter Zug (meist Schach oder starke Drohung), bevor du die „erwartete“ Antwort spielst – z. B. das Zurückschlagen.

**Frage vor jedem automatischen Zurückschlagen:** Gibt es vorher ein Schach, eine Schlagdrohung oder ein Mattmotiv, das der Gegner beantworten muss?`,
  },
  {
    id: 'xray', group: 'Taktische Motive', title: 'Röntgenangriff', theme: 'xRayAttack', level: 'Erfahren',
    summary: 'Durch eine Figur hindurch wirken.',
    body: `Beim **Röntgenangriff** wirkt eine Figur durch eine andere hindurch: Sie deckt ein Feld oder greift an, obwohl eine Figur dazwischensteht – sobald diese getauscht wird, wird die Wirkung sichtbar.

Typisch bei verdoppelten Türmen oder Dame und Läufer auf einer Diagonale.`,
  },
  {
    id: 'sacrifice', group: 'Taktische Motive', title: 'Opfer', theme: 'sacrifice', level: 'Erfahren',
    summary: 'Material geben, um mehr zurückzubekommen.',
    body: `Ein **Opfer** gibt Material ab, um etwas Wertvolleres zu erreichen: Matt, Rückgewinn mit Zinsen, oder einen entscheidenden Angriff.

- Rechne Opfer **konkret** durch – zuerst alle Schachs, dann Schlagzüge, dann Drohungen.
- Opfer funktionieren meist, wenn der gegnerische König schlecht geschützt ist oder Figuren überlastet sind.`,
  },
  // ---------- Mattbilder ----------
  {
    id: 'mate1', group: 'Mattbilder', title: 'Matt in 1', theme: 'mateIn1', level: 'Einsteiger',
    summary: 'Den sofortigen Mattzug finden.',
    body: `Matt bedeutet: Der König steht im Schach, und es gibt keinen Zug, der das Schach aufhebt.

**Prüfe bei jedem Schach drei Dinge:**
1. Kann der König auf ein freies, ungedecktes Feld ziehen?
2. Kann die schachgebende Figur geschlagen werden?
3. Kann man dazwischenziehen?

Wenn alle drei Antworten *nein* sind: Matt!`,
  },
  {
    id: 'mate2', group: 'Mattbilder', title: 'Matt in 2', theme: 'mateIn2', level: 'Fortgeschritten',
    summary: 'Zwei-Züger: vorbereiten und zuschlagen.',
    body: `Bei Matt in 2 bereitet der erste Zug das Mattbild vor – oft durch ein **Schach**, ein **Opfer** oder einen **stillen Zug**, der Fluchtfelder nimmt.

**Methode:** Suche zuerst nach dem Endbild (welches Feld müsste ich am Ende kontrollieren?), dann nach dem Zug, der genau das erzwingt.`,
  },
  {
    id: 'backrank', group: 'Mattbilder', title: 'Grundreihenmatt', theme: 'backRankMate', level: 'Einsteiger',
    summary: 'Der König ist hinter seinen eigenen Bauern eingesperrt.',
    body: `Das **Grundreihenmatt**: Turm oder Dame geben auf der letzten Reihe Schach, und der König kann nicht entkommen, weil die eigenen Bauern davorstehen.

- Angreifen: Achte auf eine **unbewachte Grundreihe** beim Gegner.
- Verteidigen: Ein **Luftloch** (h3/h6 oder g3/g6) zur richtigen Zeit verhindert solche Unfälle.`,
  },
  {
    id: 'smothered', group: 'Mattbilder', title: 'Ersticktes Matt', theme: 'smotheredMate', level: 'Fortgeschritten',
    summary: 'Ein Springer setzt den von eigenen Figuren umzingelten König matt.',
    body: `Beim **erstickten Matt** ist der König von eigenen Figuren eingeschlossen; ein Springer gibt Matt.

**Das berühmte Muster:** Dame gibt Schach auf g8 (Turm muss schlagen), danach Springer f7 matt. Das Damenopfer dient dazu, das letzte Fluchtfeld zu verstopfen.`,
  },
  {
    id: 'anastasia', group: 'Mattbilder', title: 'Anastasias Matt', theme: 'anastasiaMate', level: 'Erfahren',
    summary: 'Springer und Turm am Rand.',
    body: `**Anastasias Matt:** Ein Springer (z. B. auf e7) nimmt dem König Fluchtfelder, und ein Turm oder die Dame setzt auf der h-Linie matt, wenn der König am Rand eingesperrt ist (oft nach Damenopfer auf h7).`,
  },
  {
    id: 'arabian', group: 'Mattbilder', title: 'Arabisches Matt', theme: 'arabianMate', level: 'Fortgeschritten',
    summary: 'Turm und Springer gegen den König in der Ecke.',
    body: `**Arabisches Matt:** Der König steht in der Ecke (h8), der Turm gibt auf h7 oder auf der Grundreihe Schach, der Springer (auf f6) deckt den Turm und nimmt das letzte Feld. Eines der ältesten bekannten Mattbilder.`,
  },
  {
    id: 'hook', group: 'Mattbilder', title: 'Hakenmatt', theme: 'hookMate', level: 'Erfahren',
    summary: 'Turm, Springer und Bauer im Verbund.',
    body: `Beim **Hakenmatt** gibt ein Turm Schach, der von einem Springer gedeckt wird, der wiederum durch einen Bauern geschützt ist. Der König wird von seinen eigenen Figuren blockiert.`,
  },
  {
    id: 'boden', group: 'Mattbilder', title: 'Bodens Matt', theme: 'bodenMate', level: 'Erfahren',
    summary: 'Zwei Läufer auf sich kreuzenden Diagonalen.',
    body: `**Bodens Matt** entsteht meist nach langer Rochade: Zwei Läufer kontrollieren sich kreuzende Diagonalen, eigene Figuren (Turm auf d8, Bauern) blockieren den König. Oft eingeleitet durch ein Damenopfer auf c6/c3.`,
  },
  // ---------- Angriff & Verteidigung ----------
  {
    id: 'f7', group: 'Angriff & Verteidigung', title: 'Angriff auf f7/f2', theme: 'attackingF2F7', level: 'Einsteiger',
    summary: 'Der schwächste Punkt in der Eröffnung.',
    body: `Die Felder **f7** und **f2** sind am Anfang nur vom König gedeckt – ein beliebtes Ziel (Schäfermatt, Fried-Liver-Angriff, Läuferopfer Bxf7+).

- Angreifen: Läufer auf c4 + Springer g5 oder Dame h5 zielen auf f7.
- Verteidigen: Entwickle schnell, rochiere früh, und decke f7 mit Springer f6 oder Dame e7.`,
  },
  {
    id: 'kingside', group: 'Angriff & Verteidigung', title: 'Königsangriff', theme: 'kingsideAttack', level: 'Fortgeschritten',
    summary: 'Figuren gegen den rochierten König bündeln.',
    body: `Ein **Königsangriff** gelingt, wenn du **mehr Figuren** in der Nähe des gegnerischen Königs hast als er Verteidiger.

**Zutaten:** offene Linien (h- oder g-Linie), Läufer auf der langen Diagonale, Dame + Springer in der Nähe, Bauernsturm (h4–h5) bei gleichseitiger Rochade nur mit Vorsicht.`,
  },
  {
    id: 'exposed', group: 'Angriff & Verteidigung', title: 'Ungeschützter König', theme: 'exposedKing', level: 'Fortgeschritten',
    summary: 'Einen offenen König mit Schachs jagen.',
    body: `Steht der gegnerische König ohne Bauernschutz in der Mitte oder im Freien, sind **Schachs und Doppelangriffe** fast immer stark.

Rechne alle Schachs durch – oft folgt eine Gabel oder ein Matt.`,
  },
  {
    id: 'defense', group: 'Angriff & Verteidigung', title: 'Verteidigungszüge', theme: 'defensiveMove', level: 'Fortgeschritten',
    summary: 'Den einzigen Zug finden, der die Stellung hält.',
    body: `Nicht jede Aufgabe ist ein Angriff: Manchmal musst du die **einzige Verteidigung** finden.

**Checkliste:** Was droht der Gegner konkret? Kann ich die Drohung mit Tempo abwehren (Gegenangriff, Schach)? Kann ich tauschen, um den Angriff zu entschärfen?`,
  },
  {
    id: 'quiet', group: 'Angriff & Verteidigung', title: 'Stille Züge', theme: 'quietMove', level: 'Erfahren',
    summary: 'Die stärksten Züge sind nicht immer Schach oder Schlagen.',
    body: `Ein **stiller Zug** schlägt nichts und gibt kein Schach – droht aber etwas Unparierbares oder nimmt dem Gegner entscheidende Felder.

Wenn alle forcierenden Züge nicht funktionieren: Suche nach einem Zug, der eine **zweite Drohung** vorbereitet.`,
  },
  // ---------- Endspiele ----------
  {
    id: 'promotion', group: 'Endspiele', title: 'Bauernumwandlung', theme: 'promotion', level: 'Einsteiger',
    summary: 'Freibauern zur Dame machen.',
    body: `Im Endspiel entscheidet oft ein **Freibauer**. Bring ihn mit Unterstützung voran und räume Hindernisse weg (Ablenkung, Durchbruch).

- **Quadratregel:** Ein König kann einen Bauern einholen, wenn er im „Quadrat“ des Bauern steht.
- Manchmal ist eine **Unterverwandlung** (Springer!) stärker als eine Dame.`,
  },
  {
    id: 'pawnend', group: 'Endspiele', title: 'Bauernendspiele', theme: 'pawnEndgame', level: 'Fortgeschritten',
    summary: 'Opposition, Durchbruch und aktive Könige.',
    body: `In **Bauernendspielen** zählt jedes Tempo.

- **Opposition:** Stehen sich die Könige mit einem Feld Abstand gegenüber, muss der Gegner, der am Zug ist, weichen.
- **Aktiver König** ist alles – zentralisieren!
- **Durchbruch:** Mit Bauernopfern einen Freibauern erzwingen.`,
  },
  {
    id: 'rookend', group: 'Endspiele', title: 'Turmendspiele', theme: 'rookEndgame', level: 'Erfahren',
    summary: 'Die häufigsten Endspiele überhaupt.',
    body: `**Turmendspiele** sind die häufigsten Endspiele.

- Türme gehören **hinter Freibauern** – eigene wie gegnerische.
- Ein aktiver Turm ist oft einen Bauern wert.
- Schachs von hinten oder von der Seite halten oft Remis; achte auf Spieße.`,
  },
  {
    id: 'zugzwang', group: 'Endspiele', title: 'Zugzwang', theme: 'zugzwang', level: 'Erfahren',
    summary: 'Wenn jeder Zug die Stellung verschlechtert.',
    body: `**Zugzwang:** Der Gegner würde am liebsten passen, muss aber ziehen – und jeder Zug verschlechtert seine Stellung.

Typisch in Bauern- und Leichtfigurenendspielen. Der Trick ist oft ein **Wartezug**, der die Zugpflicht an den Gegner zurückgibt.`,
  },
];

/** Endspieltechnik gegen volle Engine-Stärke */
export const DRILLS: Drill[] = [
  {
    id: 'kq', title: 'Dame + König gegen König', summary: 'Das wichtigste Grundmatt.',
    fen: '8/8/8/4k3/8/8/8/3QK3 w - - 0 1',
    goal: '**Ziel:** Setze den König matt. Treibe ihn mit der Dame an den Rand (Springerabstand halten!), hol deinen König heran und gib dann Matt. Vorsicht vor Patt!',
  },
  {
    id: 'kr', title: 'Turm + König gegen König', summary: 'Mit der „Kasten-Methode“ mattsetzen.',
    fen: '8/8/8/4k3/8/8/8/R3K3 w - - 0 1',
    goal: '**Ziel:** Setze den König matt. Verkleinere mit dem Turm schrittweise den Kasten, in dem der König steht, und nutze deinen König, um die Opposition zu erzwingen.',
  },
  {
    id: 'kbb', title: 'Zwei Läufer gegen König', summary: 'Schwerer: Läuferpaar arbeitet zusammen.',
    fen: '8/8/8/4k3/8/8/8/2B1KB2 w - - 0 1',
    goal: '**Ziel:** Setze den König mit beiden Läufern matt. Die Läufer bilden nebeneinander eine Mauer; der König muss in eine Ecke getrieben werden.',
  },
  {
    id: 'kp', title: 'Bauer + König gegen König', summary: 'Opposition: Bauer zur Dame bringen.',
    fen: '4k3/8/4K3/4P3/8/8/8/8 w - - 0 1',
    goal: '**Ziel:** Bring den Bauern zur Umwandlung und gewinne. Halte deinen König vor dem Bauern und nutze die Opposition.',
  },
];

// ---------- English ----------

const LESSONS_EN: Record<string, { title: string; summary: string; body: string }> = {
  hanging: {
    title: 'Hanging Pieces',
    summary: 'Spot undefended pieces – and collect them for free.',
    body: `A piece is **hanging** when it is attacked and not (sufficiently) defended. Most games below 1200 are decided exactly like this.

**How to approach it**
- Before every move ask: *What changed with my opponent's last move?*
- Count attackers and defenders: more attackers than defenders = you win material.
- Check the other way round too: are **your** pieces still defended after your move?`,
  },
  fork: {
    title: 'The Fork',
    summary: 'One piece attacks two targets at once.',
    body: `In a **fork**, one piece attacks two (or more) enemy pieces at the same time. Your opponent can only save one.

**Typical**
- **Knight forks** are the most dangerous because a knight can't be blocked – especially check + queen.
- Pawns often fork two minor pieces (e.g. e4–e5 against knight and bishop).
- The queen likes to fork with check plus an attack on an undefended piece.

**Tip:** Look for squares from which you hit the king and queen (or two undefended pieces) at once.`,
  },
  pin: {
    title: 'The Pin',
    summary: "A piece can't move because something more valuable stands behind it.",
    body: `In a **pin**, a long-range piece (bishop, rook, queen) attacks a piece that has a more valuable piece behind it.

- **Absolute pin:** the king is behind – the piece may not move at all.
- **Relative pin:** e.g. the queen is behind – moving would be expensive.

**How to exploit it:** Attack the pinned piece once more (often with a pawn). It can't step away.`,
  },
  skewer: {
    title: 'The Skewer',
    summary: 'The reverse pin: the valuable piece is in front.',
    body: `In a **skewer**, the more valuable piece stands **in front**. It has to move – and the piece behind it is lost.

- Classic: bishop or rook check, the king steps aside, the queen behind falls.
- Especially common in rook endgames and when king and queen share a line.

**Tip:** Watch out when king and queen (or king and rook) are on the same file, rank or diagonal.`,
  },
  discovered: {
    title: 'Discovered Attack',
    summary: "A piece moves away and opens another piece's line.",
    body: `In a **discovered attack**, a piece moves away and unmasks the line of a piece behind it. That creates **two threats with one move**.

- Strongest as a **discovered check**: the moving piece can capture almost anything, because the opponent has to deal with the check first.
- Look for pieces that "hide" each other on a line.`,
  },
  doublecheck: {
    title: 'Double Check',
    summary: 'Two checks at once – only the king can move.',
    body: `A **double check** arises from a discovery in which the moving piece also gives check.

- It can be neither captured nor blocked – **only a king move** helps.
- That's why double checks often work even when the moving piece is undefended.
- Frequently the start of a mating attack.`,
  },
  deflection: {
    title: 'Deflection',
    summary: 'Lure a defender away from its job.',
    body: `With **deflection** you force an enemy piece to leave its post – usually with a capture offer or a check.

- Ask yourself: *Which enemy piece is holding everything together?* (Does it guard a mating square, another piece, a promotion square?)
- That piece is **overloaded** if it has two jobs at once – then a sacrifice is often enough.`,
  },
  attraction: {
    title: 'Attraction',
    summary: 'Lure a piece (often the king) to a bad square.',
    body: `With **attraction** you use a sacrifice to lure an enemy piece – usually the king – onto a square where a tactic becomes possible (fork, skewer, mate).

**Pattern:** a sacrifice on f7/f2 or h7/h2, the king captures, then a knight fork or a mating net follows.`,
  },
  defender: {
    title: 'Removing the Defender',
    summary: 'First take the guard, then the target.',
    body: `If a piece is defended by only **one** other piece, capture (or trade) the defender – then the actual target is hanging.

- Common: a bishop takes the knight that guards the mating square h7 or protects the queen.
- Always count **who defends what**.`,
  },
  trapped: {
    title: 'Trapped Pieces',
    summary: 'Catch pieces that have no escape squares.',
    body: `A piece is **trapped** when it is attacked and all its escape squares are missing or covered.

- Typical: a bishop on a7/h7 after grabbing a pawn (…b6 traps it), a knight on the rim, the queen deep in enemy territory.
- Remember: *A knight on the rim is dim.*`,
  },
  intermezzo: {
    title: 'In-between Move',
    summary: "Don't recapture right away – play a stronger threat first.",
    body: `An **in-between move** (zwischenzug) is an unexpected move (usually a check or a strong threat) before you play the "expected" reply – such as recapturing.

**Before every automatic recapture ask:** Is there a check, a capture threat or a mating motif first that the opponent has to answer?`,
  },
  xray: {
    title: 'X-Ray Attack',
    summary: 'Act through another piece.',
    body: `In an **x-ray attack**, a piece acts through another one: it defends a square or attacks even though a piece stands in between – as soon as that piece is exchanged, the effect becomes visible.

Typical with doubled rooks or queen and bishop on the same diagonal.`,
  },
  sacrifice: {
    title: 'Sacrifice',
    summary: 'Give material to get more back.',
    body: `A **sacrifice** gives up material to achieve something more valuable: mate, winning it back with interest, or a decisive attack.

- Calculate sacrifices **concretely** – first all checks, then captures, then threats.
- Sacrifices usually work when the enemy king is poorly protected or pieces are overloaded.`,
  },
  mate1: {
    title: 'Mate in 1',
    summary: 'Find the immediate mating move.',
    body: `Checkmate means: the king is in check and there is no move that gets it out of check.

**Check three things with every check:**
1. Can the king move to a free, unguarded square?
2. Can the checking piece be captured?
3. Can something be put in between?

If all three answers are *no*: mate!`,
  },
  mate2: {
    title: 'Mate in 2',
    summary: 'Two-movers: prepare and strike.',
    body: `In a mate in 2, the first move prepares the mating picture – often with a **check**, a **sacrifice** or a **quiet move** that takes away escape squares.

**Method:** Look for the final picture first (which square would I need to control at the end?), then for the move that forces exactly that.`,
  },
  backrank: {
    title: 'Back-Rank Mate',
    summary: 'The king is locked in behind its own pawns.',
    body: `The **back-rank mate**: a rook or queen gives check on the last rank and the king can't escape because its own pawns are in front of it.

- Attacking: watch for an **unguarded back rank** on the opponent's side.
- Defending: a **luft** (h3/h6 or g3/g6) at the right moment prevents such accidents.`,
  },
  smothered: {
    title: 'Smothered Mate',
    summary: 'A knight mates the king surrounded by its own pieces.',
    body: `In a **smothered mate**, the king is boxed in by its own pieces and a knight delivers mate.

**The famous pattern:** the queen gives check on g8 (the rook has to take), then knight f7 is mate. The queen sacrifice serves to plug the last escape square.`,
  },
  anastasia: {
    title: "Anastasia's Mate",
    summary: 'Knight and rook on the edge.',
    body: `**Anastasia's mate:** a knight (e.g. on e7) takes away escape squares, and a rook or the queen mates on the h-file while the king is trapped on the edge (often after a queen sacrifice on h7).`,
  },
  arabian: {
    title: 'Arabian Mate',
    summary: 'Rook and knight against the king in the corner.',
    body: `**Arabian mate:** the king stands in the corner (h8), the rook gives check on h7 or on the back rank, and the knight (on f6) protects the rook and covers the last square. One of the oldest known mating patterns.`,
  },
  hook: {
    title: 'Hook Mate',
    summary: 'Rook, knight and pawn working together.',
    body: `In a **hook mate**, a rook gives check, protected by a knight, which in turn is protected by a pawn. The king is blocked by its own pieces.`,
  },
  boden: {
    title: "Boden's Mate",
    summary: 'Two bishops on criss-crossing diagonals.',
    body: `**Boden's mate** usually happens after queenside castling: two bishops control crossing diagonals while the king's own pieces (rook on d8, pawns) block it in. Often introduced by a queen sacrifice on c6/c3.`,
  },
  f7: {
    title: 'Attacking f7/f2',
    summary: 'The weakest point in the opening.',
    body: `At the start, the squares **f7** and **f2** are only defended by the king – a favorite target (Scholar's mate, Fried Liver Attack, the bishop sacrifice Bxf7+).

- Attacking: a bishop on c4 plus a knight on g5 or the queen on h5 aim at f7.
- Defending: develop quickly, castle early, and cover f7 with Nf6 or Qe7.`,
  },
  kingside: {
    title: 'Kingside Attack',
    summary: 'Bring your pieces together against the castled king.',
    body: `A **kingside attack** works when you have **more pieces** near the enemy king than it has defenders.

**Ingredients:** open lines (h- or g-file), a bishop on the long diagonal, queen + knight nearby, a pawn storm (h4–h5) – but careful with it when both sides castled the same way.`,
  },
  exposed: {
    title: 'Exposed King',
    summary: 'Hunt an open king with checks.',
    body: `If the enemy king stands in the center or in the open without pawn cover, **checks and double attacks** are almost always strong.

Calculate all checks – a fork or mate often follows.`,
  },
  defense: {
    title: 'Defensive Moves',
    summary: 'Find the only move that holds the position.',
    body: `Not every puzzle is an attack: sometimes you have to find the **only defense**.

**Checklist:** What exactly does the opponent threaten? Can I parry the threat with tempo (counter-attack, check)? Can I trade pieces to defuse the attack?`,
  },
  quiet: {
    title: 'Quiet Moves',
    summary: "The strongest moves aren't always checks or captures.",
    body: `A **quiet move** captures nothing and gives no check – but it threatens something unstoppable or takes away decisive squares.

When all forcing moves fail: look for a move that prepares a **second threat**.`,
  },
  promotion: {
    title: 'Pawn Promotion',
    summary: 'Turn passed pawns into queens.',
    body: `In the endgame, a **passed pawn** often decides. Push it with support and clear the obstacles (deflection, breakthrough).

- **Rule of the square:** a king can catch a pawn if it stands inside the pawn's "square".
- Sometimes an **underpromotion** (knight!) is stronger than a queen.`,
  },
  pawnend: {
    title: 'Pawn Endgames',
    summary: 'Opposition, breakthroughs and active kings.',
    body: `In **pawn endgames** every tempo counts.

- **Opposition:** when the kings face each other with one square between them, the side to move has to give way.
- An **active king** is everything – centralize it!
- **Breakthrough:** force a passed pawn with pawn sacrifices.`,
  },
  rookend: {
    title: 'Rook Endgames',
    summary: 'The most common endgames of all.',
    body: `**Rook endgames** are the most common endgames.

- Rooks belong **behind passed pawns** – yours and your opponent's.
- An active rook is often worth a pawn.
- Checks from behind or from the side often hold the draw; watch out for skewers.`,
  },
  zugzwang: {
    title: 'Zugzwang',
    summary: 'When every move makes the position worse.',
    body: `**Zugzwang:** your opponent would love to pass but has to move – and every move makes their position worse.

Typical in pawn and minor-piece endgames. The trick is often a **waiting move** that hands the obligation to move back to the opponent.`,
  },
};

const DRILLS_EN: Record<string, { title: string; summary: string; goal: string }> = {
  kq: {
    title: 'Queen + King vs King',
    summary: 'The most important basic mate.',
    goal: '**Goal:** Checkmate the king. Drive it to the edge with your queen (keep a knight\'s distance!), bring your king closer, then deliver mate. Beware of stalemate!',
  },
  kr: {
    title: 'Rook + King vs King',
    summary: 'Mate with the "box" method.',
    goal: '**Goal:** Checkmate the king. Shrink the box the king lives in step by step with your rook and use your king to force the opposition.',
  },
  kbb: {
    title: 'Two Bishops vs King',
    summary: 'Harder: the bishop pair works together.',
    goal: '**Goal:** Checkmate the king with both bishops. Side by side the bishops form a wall; the king has to be driven into a corner.',
  },
  kp: {
    title: 'Pawn + King vs King',
    summary: 'Opposition: bring the pawn home.',
    goal: '**Goal:** Promote the pawn and win. Keep your king in front of the pawn and use the opposition.',
  },
};

if (lang === 'en') {
  for (const l of LESSONS) Object.assign(l, LESSONS_EN[l.id] ?? {});
  for (const d of DRILLS) Object.assign(d, DRILLS_EN[d.id] ?? {});
}

/** Angezeigter Gruppenname */
export function groupLabel(g: string) {
  if (lang !== 'en') return g;
  return ({ 'Taktische Motive': 'Tactical Motifs', Mattbilder: 'Mating Patterns', 'Angriff & Verteidigung': 'Attack & Defense', Endspiele: 'Endgames' } as Record<string, string>)[g] ?? g;
}

/** Angezeigte Schwierigkeitsstufe */
export function levelLabel(l: string) {
  if (lang !== 'en') return l;
  return ({ Einsteiger: 'Beginner', Fortgeschritten: 'Intermediate', Erfahren: 'Advanced' } as Record<string, string>)[l] ?? l;
}
