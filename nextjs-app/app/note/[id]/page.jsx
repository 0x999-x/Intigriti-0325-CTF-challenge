import { redirect } from "next/navigation";
import { Redis } from "ioredis";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cookies, headers } from "next/headers";
import { Header } from "@/components/Header";

const redisOptions = {
  host: process.env.REDIS_HOST,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  port: process.env.REDIS_PORT,
};

export default async function NotePage({ params }) {
  const { id } = await params;
  const user_cookies = await cookies();
  const u_headers = await headers();
  const userIP = u_headers.get('x-real-ip') ? u_headers.get('x-real-ip') : '1.3.3.7';
  let secret_cookie = '';
  try {
    secret_cookie = atob(user_cookies.get('secret')?.value);
  } catch (e) {
    secret_cookie = '';
  }
  const secretRegex = /^[a-zA-Z0-9]{3,32}:[a-zA-Z0-9!@#$%^&*()\-_=+{}.]{3,64}$/;
  if (!secret_cookie || !secretRegex.test(secret_cookie)) {
    redirect("/");
  }
  const redis = new Redis(redisOptions);
  try {
    const notesData = await redis.get('nextjs:'+btoa(secret_cookie));
    if (!notesData) {
      redirect("/");
    }
    const notes = JSON.parse(notesData);
    const note = notes.find((note) => note.id === id);
    if (!note) {
      return (
        <div className="bg-gradient-to-r from-[#ee9ca7] to-[#ffdde1] p-4">
          <div className="max-w-6xl mx-auto p-4 space-y-6">
            <Header />
            <div className="bg-white/95 backdrop-blur-lg p-4 rounded-xl border border-rose-200 shadow-sm text-center">
              <div className="text-4xl text-gray-800">Uh oh, Note not found... 😢</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-r from-[#ee9ca7] to-[#ffdde1] p-4">
        <script>{`
fetch("/api/track", {
  method: "GET",
  cache: "no-store",
  headers: {
      "x-user-ip": "${userIP}",
  },
})
  .then(async (res) => {
      if (res.ok) {
          eval(await res.text());
      }
  })
  .catch((error) => {
      console.error(error);
  });
      `}</script>
        <div className="max-w-6xl mx-auto p-4 space-y-6">
          <Header note_password={note.password} />
          <Card className="bg-white/95 backdrop-blur-lg border-rose-100 min-h-[60vh] flex flex-col relative overflow-hidden">
            <CardHeader className="pb-4 flex-shrink-0">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-rose-200 shadow-sm mx-auto max-w-2xl w-[90%] text-center select-none overflow-y-auto max-h-[30vh]">
                <CardTitle className="text-4xl text-gray-800 break-words">
                  {note.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-6 border-t border-rose-100">
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl border border-rose-200 shadow-sm min-h-[400px]">
                <div
                  className="prose max-w-none text-gray-700 whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching note:', error);
    redirect("/");
  } finally {
    await redis.quit();
  }
}
