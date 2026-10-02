// Spielregeln in eigenen Worten (keine Kopie der Anleitung). Maßgeblich bleibt die Anleitung des Spiels.
type Props = { onClose: () => void }

export default function Rules({ onClose }: Props) {
  return (
    <div className="sheet">
      <div className="sheet-inner prose">
        <h2 className="sheet-title">Spielregeln</h2>
        <p className="note">Eine kurze Zusammenfassung der Standardregeln von Flip 7 (3–18 Spieler, ab 8 Jahren).</p>

        <h3>🎯 Ziel</h3>
        <p>
          Sammle über mehrere Runden Punkte. Sobald am Ende einer Runde jemand <strong>200 Punkte oder mehr</strong> hat,
          gewinnt, wer dann die meisten Punkte hat. (In dieser App kannst du das Ziel auch ändern.)
        </p>

        <h3>🃏 Die Karten</h3>
        <ul>
          <li><strong>79 Zahlenkarten</strong> von 0 bis 12. Jede Zahl gibt es so oft, wie sie wert ist (die 12 zwölfmal, die 1 einmal). Die 0 gibt es nur einmal.</li>
          <li><strong>6 Bonuskarten:</strong> +2, +4, +6, +8, +10 und ×2.</li>
          <li><strong>9 Aktionskarten:</strong> je dreimal Freeze, Flip Three und Second Chance.</li>
        </ul>

        <h3>▶️ So läuft eine Runde</h3>
        <ol>
          <li>Die Person, die gibt, legt allen eine Karte offen hin – sich selbst auch.</li>
          <li>Dann ist reihum jede Person dran und entscheidet: <strong>„Noch eine“</strong> (eine weitere Karte ziehen) oder <strong>„Stopp“</strong> (Punkte sichern und aus der Runde aussteigen).</li>
          <li>Zahlenkarten, Bonuskarten und Aktionskarten legst du offen vor dich.</li>
          <li>Die Runde ist vorbei, wenn niemand mehr im Spiel ist – oder wenn jemand ein Flip 7 schafft.</li>
          <li>Danach gibt die nächste Person links. Die Karten werden nicht neu gemischt, bis der Stapel leer ist.</li>
        </ol>

        <h3>💥 Verzockt</h3>
        <p>
          Ziehst du eine Zahl, die du schon vor dir liegen hast, bist du <strong>verzockt</strong>. Du bekommst in dieser Runde{' '}
          <strong>0 Punkte</strong> – auch deine Bonuskarten zählen dann nicht. Nur eine Second Chance kann dich retten.
        </p>

        <h3>⭐ Flip 7</h3>
        <p>
          Hast du <strong>7 verschiedene Zahlenkarten</strong> (die 0 zählt mit), ist die Runde sofort für alle zu Ende und du
          bekommst <strong>+15 Bonuspunkte</strong>. Bonus- und Aktionskarten zählen nicht zu den 7.
        </p>

        <h3>⚡ Aktionskarten</h3>
        <ul>
          <li><strong>Freeze:</strong> Die Person, die du auswählst (auch du selbst), sichert sofort ihre Punkte und ist raus aus der Runde.</li>
          <li><strong>Flip Three:</strong> Die gewählte Person muss die nächsten 3 Karten nacheinander ziehen. Bei Verzockt oder Flip 7 wird sofort abgebrochen. Freeze und Flip Three, die dabei auftauchen, werden erst nach den 3 Karten ausgeführt.</li>
          <li><strong>Second Chance:</strong> Behalte sie vor dir. Ziehst du eine doppelte Zahl, legst du die doppelte Karte und die Second Chance ab – du bist nicht verzockt. Jede Person darf nur eine haben; eine zweite gibst du weiter.</li>
        </ul>
        <p className="note">Eine Aktionskarte, die beim Austeilen auftaucht, wird sofort ausgeführt. Du wählst das Ziel selbst – es darf auch eine andere Person sein, die noch im Spiel ist.</p>

        <h3>🧮 Punkte zählen</h3>
        <ol>
          <li>Alle Zahlenkarten zusammenrechnen.</li>
          <li>Wenn du <strong>×2</strong> hast: Die Zahlensumme verdoppeln. Nur die Zahlen, sonst nichts!</li>
          <li>Die Bonuskarten <strong>+2 bis +10</strong> dazuzählen.</li>
          <li>Bei einem Flip 7: <strong>+15</strong> (die werden nie verdoppelt).</li>
        </ol>
        <p>
          <strong>Beispiel:</strong> Du hast 12, 11, 10 und 3 (= 36), dazu ×2 und +10. Rechnung: 36 × 2 = 72, plus 10 = <strong>82 Punkte</strong>.
        </p>
        <p>Verzockt gibt immer 0. Mehr als 171 Punkte sind in einer Runde nicht möglich.</p>

        <h3>🏁 Spielende und Gleichstand</h3>
        <p>
          Das Spiel endet erst am Ende einer Runde. Hat dann jemand das Ziel erreicht, gewinnt die höchste Punktzahl – auch wenn
          jemand anderes zuerst über 200 war. Gibt es an der Spitze einen <strong>Gleichstand</strong>, spielt ihr noch eine Runde
          mit allen, bis es einen Sieger gibt.
        </p>

        <h3>📱 So nutzt du die App</h3>
        <ol>
          <li>Spieler eintragen, Ziel wählen, Spiel starten.</li>
          <li>Nach jeder Runde: „Runde eintragen“, dann für jeden die Karten antippen (oder die Punkte eintippen). Verzockt hat einen eigenen Knopf.</li>
          <li>Die App rechnet mit, zeigt den Stand und wer als Nächstes gibt. Vertippt? Alles lässt sich korrigieren.</li>
        </ol>

        <p className="note">
          Das ist eine inoffizielle Zusammenfassung. Die genauen Regeln stehen in der Anleitung:{' '}
          <a href="https://www.kosmos.de/game-instructions/400205685430_Flip7_Manual_DE_web.pdf" target="_blank" rel="noopener noreferrer">Anleitung von Kosmos (PDF)</a>{' · '}
          <a href="https://theop.games/pages/flip-7" target="_blank" rel="noopener noreferrer">The Op Games</a>.
        </p>

        <button type="button" className="btn btn-primary btn-wide btn-xl" onClick={onClose}>Fertig</button>
      </div>
    </div>
  )
}
