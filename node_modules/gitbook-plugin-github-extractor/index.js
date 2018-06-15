module.exports = {
    // Map of hooks
    hooks: {
        "page:before": function(page) {

          /* Fetch given url and return content. */
          const fetch = function(url) {
            // return new pending promise
            return new Promise((resolve, reject) => {
              // select http or https module, depending on reqested url
              const lib = url.startsWith('https') ? require('https') : require('http');
              const request = lib.get(url, (response) => {
                // handle http errors
                if (response.statusCode < 200 || response.statusCode > 299) {
                   reject(new Error('Failed to fetch \''+ url +'\' while processing \''+ page.path +'\', status code: ' + response.statusCode));
                 }
                // temporary data holder
                const body = [];
                // on every content chunk, push it to the data array
                response.on('data', (chunk) => body.push(chunk));
                // we are done, resolve promise with those joined chunks
                response.on('end', () => resolve(body.join('')));
              });
              // handle connection errors of the request
              request.on('error', (err) => reject(err))
              })
          };

          const examples = "\\[example-?([a-z]*)\\]\\(([^#]*)#?(.*)\\)"

          /* Return content for a given extract match. */
          function content(match) {
            const result = new RegExp(examples).exec(match)
            const lang = result[1]
            const url = result[2]
            const anchor = result[3]
            return fetch(url)
              .then(text => {
                return {
                  "match": match,
                  "lang": lang,
                  "anchor": anchor,
                  "text": text
                };
              })
          }

          /* Reduct blocks into map indexed by match. */
          function blocksToMap(blocks) {
            var result = blocks.reduce(function(map, obj) {
                obj.text = contentText(obj);
                map[obj.match] = obj;
                return map;
            }, {});
            return result;
          }

          /* Return example text. Maybe anchored between //#some-identifier */
          function contentText(obj) {
            if(isEmpty(obj.anchor)) {
              return obj.text;
            } else {
              const regex = new RegExp("\\/\\/#"+obj.anchor+"\\s([\\s\\S]*)\\/\\/#"+obj.anchor)
              const result = regex.exec(obj.text);
              if(result) {
                return result[1];
              } else {
                return obj.text;
              }
            }
          }

          function isEmpty(str) {
              return (!str || 0 === str.length);
          }

          const matches = page.content.match(new RegExp(examples, "g"))
          if(matches) {
            const contents = matches.map(content);

            return Promise.all(contents).then(blocks => {

              const result = blocksToMap(blocks);

              page.content = page.content.replace(new RegExp(examples, "g"), function(match) {
                console.log("About to replace", match, "on", page.path);
                const example = result[match]
                if(isEmpty(example.lang)) {
                  return "```\n" + example.text + "\n```";
                } else if(example.lang == "raw"){
                  return "\n" + example.text + "\n";
                } else {
                  return "```"+example.lang+"\n" + example.text + "\n```";
                }
              })
              return page;
            }).catch(reason => {
              console.log("ERROR", reason)
              return page;
            });
          }
          return page;
        }
    }
};
