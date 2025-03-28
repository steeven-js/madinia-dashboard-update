import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import { useGetPost } from 'src/actions/blog';

import { PostEditView } from 'src/sections/blog/view';

// ----------------------------------------------------------------------

const metadata = { title: `Post edit | Dashboard - ${CONFIG.appName}` };

export default function PostEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const { post, postLoading } = useGetPost(id);

  // Redirect if post not found after loading completes
  useEffect(() => {
    if (!postLoading && !post) {
      router.push(paths.dashboard.post.root);
    }
  }, [post, postLoading, router]);

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PostEditView />
    </>
  );
}
