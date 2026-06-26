#!/usr/bin/env python3
import json
import re
from datetime import datetime, timezone

with open('news-scheduled.json', 'r', encoding='utf-8') as f:
    scheduled = json.load(f)

now = datetime.now(timezone.utc)
to_publish = []
remaining = []

for article in scheduled:
    # 必須フィールドのないエントリ（サンプル等）はスキップ
    required = ('id', 'publishAt', 'date', 'title', 'body')
    if not all(k in article for k in required):
        remaining.append(article)
        continue

    publish_at = datetime.fromisoformat(article['publishAt'])
    if publish_at <= now:
        to_publish.append(article)
    else:
        remaining.append(article)

if not to_publish:
    print('公開対象の記事はありません')
    exit(0)

with open('news.html', 'r', encoding='utf-8') as f:
    html = f.read()


def generate_article_html(article):
    images_html = ''
    if article.get('images'):
        imgs = '\n    '.join(
            f'<img src="{img["src"]}" alt="{img["alt"]}">'
            for img in article['images']
        )
        images_html = f'\n  <div class="article-images">\n    {imgs}\n  </div>'

    return (
        f'\n<article class="news-article fade-in" id="{article["id"]}">\n'
        f'  <p class="article-date">{article["date"]}</p>\n'
        f'  <h2 class="article-title">{article["title"]}</h2>{images_html}\n'
        f'  <p class="article-body">\n    {article["body"]}\n  </p>\n'
        f'</article>\n'
    )


new_html = ''.join(generate_article_html(a) for a in to_publish)

# page-hero div の直後に挿入
hero_pattern = r'(<div class="page-hero[^"]*"[^>]*>.*?</div>)'
match = re.search(hero_pattern, html, re.DOTALL)
if not match:
    print('ERROR: page-hero が見つかりませんでした')
    exit(1)

insert_pos = match.end()
html = html[:insert_pos] + new_html + html[insert_pos:]

with open('news.html', 'w', encoding='utf-8') as f:
    f.write(html)

with open('news-scheduled.json', 'w', encoding='utf-8') as f:
    json.dump(remaining, f, ensure_ascii=False, indent=2)

ids = [a['id'] for a in to_publish]
print(f'{len(to_publish)} 件を公開しました: {ids}')
