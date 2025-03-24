import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;
  if (path.startsWith('/view_protected_note')) {
    const query = request.nextUrl.searchParams;
    const note_id = query.get('id');
    const uuid_regex = /^[^\-]{8}-[^\-]{4}-[^\-]{4}-[^\-]{4}-[^\-]{12}$/;
    const isMatch = uuid_regex.test(note_id);
    if (note_id && isMatch) {
      const current_url = request.nextUrl.clone();
      current_url.pathname = "/note/" + note_id.normalize('NFKC');
      return NextResponse.rewrite(current_url);
    } else {
      return new NextResponse('Uh oh, Missing or Invalid Note ID :c', {
        status: 403,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }
  if (path.startsWith('/note/') && !request.nextUrl.searchParams.has('s')) {
    let secret_cookie = '';
    try {
      secret_cookie = atob(request.cookies.get('secret')?.value);
    } catch (e) {
      secret_cookie = '';
    }
    const secretRegex = /^[a-zA-Z0-9]{3,32}:[a-zA-Z0-9!@#$%^&*()\-_=+{}.]{3,64}$/;
    const newUrl = request.nextUrl.clone();
    if (!secret_cookie || !secretRegex.test(secret_cookie)) {
      return NextResponse.next();
    }
    newUrl.searchParams.set('s', 'true');
    newUrl.hash = `:~:${secret_cookie}`;
    return NextResponse.redirect(newUrl, 302);
  }
  return NextResponse.next();
}

