function withoutArticle(key) {
  return (key.match(/^(A|a|The|the)[\s_]+(.*)/)||{})[2] || key;
}

export default withoutArticle;
