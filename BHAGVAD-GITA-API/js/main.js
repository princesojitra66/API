   const apiBase = 'https://vedicscriptures.github.io';

    const chapterListEl = document.getElementById('chapterList');
    const verseListEl = document.getElementById('verseList');
    const chapterTitleEl = document.getElementById('chapterTitle');
    const verseDetailEl = document.getElementById('verseDetail');
    const slokEl = document.getElementById('slok');
    const translitEl = document.getElementById('transliteration');
    const transEl = document.getElementById('translation');

    let chapters = [];
    let currentChapter = null;
    let currentVerse = null;

    async function fetchJSON(url) {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return await resp.json();
    }

    async function loadChapters() {
      chapters = await fetchJSON(`${apiBase}/chapters`);
      chapterListEl.innerHTML = '';
      chapters.forEach(ch => {
        const li = document.createElement('li');
        li.textContent = `${ch.chapter_number}. ${ch.name}`;
        li.dataset.chapter = ch.chapter_number;
        li.tabIndex = 0;
        li.addEventListener('click', () => selectChapter(ch.chapter_number));
        li.addEventListener('keypress', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            selectChapter(ch.chapter_number);
          }
        });
        chapterListEl.appendChild(li);
      });
    }

    async function selectChapter(chNum) {
      currentChapter = chNum;
      currentVerse = null;

      [...chapterListEl.children].forEach(li => {
        li.classList.toggle('active', li.dataset.chapter == chNum);
      });

      const ch = chapters.find(c => c.chapter_number == chNum);
      chapterTitleEl.textContent = `अध्याय ${chNum}: ${ch.name}`;

      const chData = await fetchJSON(`${apiBase}/chapter/${chNum}`);
      verseListEl.innerHTML = '';
      const totalVerses = chData.verses_count || (chData.verses ? chData.verses.length : 0);

      for (let i = 1; i <= totalVerses; i++) {
        const li = document.createElement('li');
        li.textContent = `श्लोक ${i}`;
        li.dataset.verse = i;
        li.tabIndex = 0;
        li.addEventListener('click', () => selectVerse(chNum, i));
        li.addEventListener('keypress', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            selectVerse(chNum, i);
          }
        });
        verseListEl.appendChild(li);
      }

      verseDetailEl.style.display = 'none';
    }

    async function selectVerse(chNum, verseNum) {
      currentVerse = verseNum;

      [...verseListEl.children].forEach(li => {
        li.classList.toggle('active', li.dataset.verse == verseNum);
      });

      const data = await fetchJSON(`${apiBase}/slok/${chNum}/${verseNum}`);
      slokEl.textContent = data.slok || '';
      translitEl.textContent = data.transliteration || '';
      transEl.textContent = data.translation || '';
      verseDetailEl.style.display = 'block';
      verseDetailEl.scrollIntoView({behavior: 'smooth'});
    }



      const themeToggleBtn = document.getElementById('themeToggleBtn');

  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('night');
    if (document.body.classList.contains('night')) {
      themeToggleBtn.textContent = 'Day Mode';
      themeToggleBtn.setAttribute('aria-label', 'Switch to Day Mode');
    } else {
      themeToggleBtn.textContent = 'Night Mode';
      themeToggleBtn.setAttribute('aria-label', 'Switch to Night Mode');
    }
  });


  
    loadChapters();