import "dotenv/config";
import { createDb } from "./index";
import * as schema from "./schema";

const db = createDb(process.env.DATABASE_URL!);

const LOREM_BIO =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.";

const LOREM_SYNOPSIS =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet consectetur adipisci velit.";


async function seed() {
  console.log("Clearing existing data...");
  await db.delete(schema.miracleSources);
  await db.delete(schema.saintLocations);
  await db.delete(schema.saintSources);
  await db.delete(schema.saintRelations);
  await db.delete(schema.miracleSaints);
  await db.delete(schema.miracles);
  await db.delete(schema.saints);

  console.log("Seeding saints...");

  const insertedSaints = await db
    .insert(schema.saints)
    .values([
      {
        slug: "john-paul-ii",
        published: true,
        name: "Pope John Paul II",
        saint_name: "Saint John Paul II",
        birth_name: "Karol Jozef Wojtyla",
        birth_date: "1920-05-18",
        death_date: "2005-04-02",
        feast_day: "October 22",
        nationality: "Polish",
        beatification_date: "2011-05-01",
        beatified_by: "Pope Benedict XVI",
        canonization_date: "2014-04-27",
        canonized_by: "Pope Francis",
        canonization_type: "confessor",
        canonization_stage: "saint",
        patronage: ["World Youth Day", "families", "young Catholics"],
        themes: ["perseverance", "missionaries", "eucharistic", "marian", "conversion"],
        biography_short: `Karol Józef Wojtyła was born on May 18, 1920, in Wadowice, Poland, the youngest of three children of a devout Catholic family. His early life was shaped by loss — his mother died when he was eight, his older brother when he was twelve, and his father when he was twenty. By then, he was alone.

He studied Polish literature at the Jagiellonian University in Kraków until the Nazi occupation of Poland forced the university underground. During the war years he worked in a quarry and chemical factory while secretly studying for the priesthood. He was ordained on November 1, 1946.

His rise through the Church was rapid. He was appointed bishop in 1958, Archbishop of Kraków in 1964, and elevated to cardinal in 1967. On October 16, 1978, he was elected Pope — the first non-Italian pontiff in 455 years and the first Polish pope in history. He took the name John Paul II.

His 26-year pontificate was one of the most consequential in modern history. He traveled to 129 countries — more than any pope before him — and drew millions to World Youth Days he personally founded. His moral and political witness was widely credited as a decisive factor in the peaceful collapse of communism in Eastern Europe. He was shot and nearly killed in St. Peter's Square on May 13, 1981; he later visited his would-be assassin in prison and publicly forgave him.

He died on April 2, 2005, to an outpouring of grief that drew an estimated four million people to Rome. He was beatified by Pope Benedict XVI on May 1, 2011, and canonized by Pope Francis on April 27, 2014, alongside Pope John XXIII.`,
        gender: "male",
        lay_person: false,
        image_url: "https://upload.wikimedia.org/wikipedia/commons/3/34/JPII_29_09_2004_2.JPG",
        wikipedia_url: "https://en.wikipedia.org/wiki/Pope_John_Paul_II",
      },
      {
        slug: "mother-teresa",
        published: true,
        name: "Mother Teresa",
        saint_name: "Saint Teresa of Calcutta",
        birth_name: "Anjeze Gonxhe Bojaxhiu",
        birth_date: "1910-08-26",
        death_date: "1997-09-05",
        feast_day: "September 5",
        religious_order: "Missionaries of Charity",
        nationality: "Albanian / Indian",
        beatification_date: "2003-10-19",
        beatified_by: "Pope John Paul II",
        canonization_date: "2016-09-04",
        canonized_by: "Pope Francis",
        canonization_type: "confessor",
        canonization_stage: "saint",
        patronage: ["World Youth Day", "Missionaries of Charity"],
        themes: ["conversion", "missionaries", "hope", "perseverance", "eucharistic"],
        biography_short: `Anjezë Gonxhe Bojaxhiu was born on August 26, 1910, in Skopje, in what is now North Macedonia, to an Albanian Catholic family. Her father died when she was eight. She grew up devout and drawn to missionary work, and at eighteen left home to join the Sisters of Loreto in Ireland — a departure she later described as a final farewell, knowing she would not return. She never did.

She took her final vows in 1937 and spent the next decade teaching at St. Mary's High School in Kolkata. Then, on September 10, 1946, while traveling by train to a spiritual retreat, she received what she called a "call within a call" — a directive she understood as Christ asking her to leave the convent and serve the poorest of the poor in the slums of the city. It took two years to receive permission. She left with five rupees and no plan.

She founded the Missionaries of Charity in 1950. The order began with thirteen members in Kolkata; by the time of her death it operated in approximately 123 countries, running hospices, orphanages, and homes for the destitute and dying. She received the Nobel Peace Prize in 1979, donating the prize money to the poor.

After her death, letters she had written to her spiritual directors over decades were published, revealing a prolonged interior darkness — a sense of God's absence that had endured for most of her public ministry. The letters were striking for what they showed: a woman who served with apparent joy while privately experiencing desolation, and who chose to continue regardless.

She died on September 5, 1997. She was beatified by Pope John Paul II on October 19, 2003, and canonized by Pope Francis on September 4, 2016, as Saint Teresa of Calcutta.`,
        gender: "female",
        lay_person: false,
        image_url: "https://upload.wikimedia.org/wikipedia/commons/8/8e/MotherTeresa_090.jpg",
        wikipedia_url: "https://en.wikipedia.org/wiki/Mother_Teresa",
      },
      {
        slug: "padre-pio",
        name: "Padre Pio",
        saint_name: "Saint Pio of Pietrelcina",
        birth_name: "Francesco Forgione",
        birth_date: "1887-05-25",
        death_date: "1968-09-23",
        feast_day: "September 23",
        religious_order: "Capuchin Franciscan",
        nationality: "Italian",
        beatification_date: "1999-05-02",
        beatified_by: "Pope John Paul II",
        canonization_date: "2002-06-16",
        canonized_by: "Pope John Paul II",
        canonization_type: "confessor",
        canonization_stage: "saint",
        patronage: ["stress relief", "civil defense volunteers", "adolescents"],
        themes: ["eucharistic", "marian", "spiritual-direction", "conversion", "perseverance"],
        biography_short: `Francesco Forgione was born on May 25, 1887, in Pietrelcina, a small hill town in the Campania region of southern Italy. He was the fourth of eight children in a devout peasant family; his father emigrated to America twice to earn money for the boy's education in a religious vocation. From childhood Francesco experienced visions and apparitions he believed were supernatural, and he entered the Capuchin Franciscan novitiate in 1903 at the age of fifteen. He took the name Pio. He was ordained a priest on August 10, 1910.

His early years in religious life were marked by chronic ill health — fevers, respiratory problems, and other ailments that repeatedly forced him to return home from his friary. In 1916 he was assigned permanently to the friary of Our Lady of Grace at San Giovanni Rotondo in Apulia, where he would remain for the rest of his life.

On September 20, 1918, while making his thanksgiving after Mass, he received the visible stigmata — the five wounds corresponding to the Passion of Christ — on his hands, feet, and side. The wounds remained open and bleeding for fifty years, until his death, and were examined by numerous physicians, Vatican investigators, and Church authorities over that period. He was the first Catholic priest known to bear the stigmata.

He became one of the most sought-after confessors of the twentieth century, hearing confessions for up to sixteen hours a day. Thousands came to San Giovanni Rotondo to seek his counsel, and reports of healings, prophecies, bilocation, and reading of souls accumulated throughout his decades of ministry. In 1956 he founded Casa Sollievo della Sofferenza — the House for the Relief of Suffering — a hospital adjacent to the friary that grew into one of the largest medical centers in southern Italy.

He died on September 23, 1968, having celebrated his fiftieth anniversary of the stigmata just three days earlier. The wounds on his hands had closed completely at the time of death, leaving no scars. He was beatified by Pope John Paul II on May 2, 1999, and canonized on June 16, 2002.`,
        gender: "male",
        lay_person: false,
        image_url: "https://upload.wikimedia.org/wikipedia/commons/8/87/Padre_Pio_portraitFXD.jpg",
        wikipedia_url: "https://en.wikipedia.org/wiki/Padre_Pio",
        published: true,
      },
      {
        slug: "faustina-kowalska",
        published: true,
        name: "Faustina Kowalska",
        saint_name: "Saint Maria Faustina Kowalska",
        birth_name: "Helena Kowalska",
        birth_date: "1905-08-25",
        death_date: "1938-10-05",
        feast_day: "October 5",
        religious_order: "Congregation of the Sisters of Our Lady of Mercy",
        nationality: "Polish",
        ministry_country: "Poland",
        beatification_date: "1993-04-18",
        beatified_by: "Pope John Paul II",
        canonization_date: "2000-04-30",
        canonized_by: "Pope John Paul II",
        canonization_type: "virgin",
        canonization_stage: "saint",
        patronage: ["Divine Mercy devotion", "sinners", "World Youth Day"],
        themes: ["conversion", "marian", "perseverance", "hope", "eucharistic"],
        biography_short: `Helena Kowalska was born on August 25, 1905, in Głogowiec, a small village in central Poland, the third of ten children in a poor farming family. She felt drawn to religious life from childhood but her family could not afford the dowry required by most convents. She spent several years working as a domestic servant to save the money herself. In 1925 she was accepted by the Congregation of the Sisters of Our Lady of Mercy in Warsaw and took the name Sister Maria Faustina. She spent the following years working in the congregation's houses as a cook, gardener, and doorkeeper — quiet, often unnoticed, behind the institutional surfaces of convent life.\n\nOn the night of February 22, 1931, in her cell at the convent in Płock, she saw Jesus standing before her clothed in white, with two rays of light — one red, one white — emanating from his heart. He instructed her to have an image painted of this vision, bearing the words "Jesus, I trust in You," and asked for the establishment of a feast of Divine Mercy on the Sunday after Easter. Over the following seven years, across convents in Płock, Vilnius, and Kraków, she continued to receive visions, locutions, and interior communications. She recorded all of it in a diary that eventually ran to more than six hundred pages.\n\nShe received the Chaplet of Divine Mercy — a prayer sequence to be said on rosary beads — in Vilnius in 1935. She was frequently ill with tuberculosis. She died on October 5, 1938, in Kraków, at the age of thirty-three. After her death, her diary circulated among Polish Catholics but came under ecclesiastical suspicion; in 1959 it was placed on a restricted list over concerns about translation errors and theological ambiguities. Polish bishops undertook a full review of the original Polish text, cleared it of the concerns, and the restrictions were lifted. Pope John Paul II — a Pole who had known of Faustina's spirituality since his years as a priest in Kraków — became the principal champion of her cause. She was beatified on April 18, 1993, and canonized on April 30, 2000. At the canonization, John Paul II established Divine Mercy Sunday as a feast of the universal Church — the first Sunday after Easter.`,
        gender: "female",
        lay_person: false,
        image_url:
          "https://upload.wikimedia.org/wikipedia/commons/0/0c/Saint_Faustyna_Kowalska_portrait_%281931%29.jpg",
        wikipedia_url: "https://en.wikipedia.org/wiki/Faustina_Kowalska",
      },
      {
        slug: "gianna-beretta-molla",
        name: "Gianna Beretta Molla",
        saint_name: "Saint Gianna Beretta Molla",
        birth_name: "Gianna Beretta Molla",
        birth_date: "1922-10-04",
        death_date: "1962-04-28",
        feast_day: "April 28",
        nationality: "Italian",
        beatification_date: "1994-04-24",
        beatified_by: "Pope John Paul II",
        canonization_date: "2004-05-16",
        canonized_by: "Pope John Paul II",
        canonization_type: "married_couple",
        canonization_stage: "saint",
        patronage: ["mothers", "families", "physicians", "unborn children"],
        themes: ["saints-of-everyday-life", "perseverance", "marian", "hope", "eucharistic"],
        biography_short: LOREM_BIO,
        gender: "female",
        lay_person: true,
        image_url: "https://upload.wikimedia.org/wikipedia/commons/8/87/GiannaBerettaMolla.jpg",
        wikipedia_url: "https://en.wikipedia.org/wiki/Gianna_Beretta_Molla",
      },
      {
        slug: "kateri-tekakwitha",
        published: true,
        name: "Kateri Tekakwitha",
        saint_name: "Saint Kateri Tekakwitha",
        birth_name: "Kateri Tekakwitha",
        birth_date: "1656-01-01",
        death_date: "1680-04-17",
        feast_day: "July 14",
        nationality: "Mohawk / Native American",
        ministry_country: "Canada",
        beatification_date: "1980-06-22",
        beatified_by: "Pope John Paul II",
        canonization_date: "2012-10-21",
        canonized_by: "Pope Benedict XVI",
        canonization_type: "virgin",
        canonization_stage: "saint",
        patronage: ["Native Americans", "ecology", "environmentalists", "exiles"],
        themes: ["conversion", "marian", "missionaries", "perseverance", "hope"],
        biography_short: `Kateri Tekakwitha was born in 1656 at Ossernenon, a Mohawk village in present-day Auriesville, New York. Her father was a Mohawk chief; her mother was an Algonquin woman who had converted to Christianity. When Kateri was four, a smallpox epidemic swept through the village and killed her parents and infant brother. She survived but was left with permanent facial scarring and severely impaired vision. Her name, Tekakwitha, has been interpreted as "she who gropes her way" — a reference to the vision loss she carried for the rest of her life.\n\nShe was taken in by her uncle, also a Mohawk chief, who was suspicious of French missionaries and hostile to the Christian faith her mother had practiced. Kateri grew up in that household, doing domestic work and weaving, attending to the rhythms of Mohawk village life. In 1675, French Jesuit missionaries came to her village and she began speaking with them. She was baptized on Easter Sunday, April 5, 1676, by Father Jacques de Lamberville, and took the name Catherine — Kateri in the Mohawk pronunciation.\n\nHer conversion made her an outcast. She refused to work on Sundays, declined the marriage her uncle arranged for her, and was accused of sorcery by neighbors. Children threw stones at her. Her food was sometimes withheld. In 1677, she fled to the Jesuit mission at Kahnawake, near Montreal, where a community of Native Christian converts had gathered.\n\nAt Kahnawake she found her footing. She attended daily Mass, received communion frequently, and spent long hours in prayer before the Blessed Sacrament. She cared for the sick and elderly, taught children, and made a private vow of virginity — an act without precedent among Mohawk women of her time. She was known for severe penitential practices and for a joy that persisted despite chronic physical suffering. She died on April 17, 1680, at the age of twenty-four. Witnesses at her deathbed reported that the smallpox scars that had marked her face since childhood vanished completely within minutes of her death.\n\nShe was beatified by Pope John Paul II on June 22, 1980, and canonized by Pope Benedict XVI on October 21, 2012 — the first Native American to be declared a saint.`,
        gender: "female",
        lay_person: true,
        image_url: "https://upload.wikimedia.org/wikipedia/commons/1/14/Kateri_Tekakwitha_1690.jpg",
        wikipedia_url: "https://en.wikipedia.org/wiki/Kateri_Tekakwitha",
      },
      {
        slug: "andre-bessette",
        published: true,
        name: "Brother Andre",
        saint_name: "Saint Andre of Montreal",
        birth_name: "Andre Bessette",
        birth_date: "1845-08-09",
        death_date: "1937-01-06",
        feast_day: "January 6",
        religious_order: "Congregation of Holy Cross",
        nationality: "Canadian",
        beatification_date: "1982-05-23",
        beatified_by: "Pope John Paul II",
        canonization_date: "2010-10-17",
        canonized_by: "Pope Benedict XVI",
        canonization_type: "confessor",
        canonization_stage: "saint",
        patronage: ["The sick", "family caregivers"],
        themes: ["spiritual-direction", "eucharistic", "marian", "perseverance", "saints-of-everyday-life"],
        biography_short: `André Bessette was born on August 9, 1845, in Mont-Saint-Grégoire, Quebec, into a large French-Canadian family. Orphaned young — his father died when he was a child, his mother not long after — he was raised by relatives and spent his adolescence working as a farmhand, cobbler, tinsmith, and laborer across Quebec and New England. His health was always precarious: he was small, thin, and prone to illness throughout his life.

In 1870, at twenty-five, he applied to enter the Congregation of Holy Cross as a lay brother. He was nearly turned away — his health was poor, he had almost no formal education, and the congregation doubted he could endure religious life. The Bishop of Montreal interceded on his behalf, and he was admitted. He became known as Brother André.

For forty years he served as porter — doorkeeper — at the Collège Notre-Dame in Côte-des-Neiges, Montreal. It was among the humblest positions in the community. Visitors who came to the door with ailments found him willing to sit with them, pray with them, and rub them with oil — directing all petitions not to himself but to Saint Joseph. Reports of healings circulated. More visitors came.

In 1904 he obtained permission to build a small wooden chapel to Saint Joseph on the slope of Mount Royal, across from the college. Pilgrims arrived from across Canada. The chapel grew into a shrine, and the shrine grew into the Basilica of Saint Joseph's Oratory of Mount Royal — today one of the largest churches in North America, drawing millions of visitors each year. The walls of the original chapel were lined with crutches and canes, left behind by those who said they had been healed.

He became known as the Miracle Man of Montreal. He deflected the attention consistently. "I do not cure," he said. "Saint Joseph cures."

He died on January 6, 1937, at the age of ninety-one — the feast day that now bears his name. He was beatified by Pope John Paul II on May 23, 1982, and canonized by Pope Benedict XVI on October 17, 2010.`,
        gender: "male",
        lay_person: false,
        image_url: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Fr%C3%A8re_Andr%C3%A9_1920.jpg",
        wikipedia_url: "https://en.wikipedia.org/wiki/Andre_Bessette",
      },
      {
        slug: "maximilian-kolbe",
        name: "Maximilian Kolbe",
        saint_name: "Saint Maximilian Kolbe",
        birth_name: "Rajmund Kolbe",
        birth_date: "1894-01-08",
        death_date: "1941-08-14",
        feast_day: "August 14",
        religious_order: "Conventual Franciscan",
        nationality: "Polish",
        beatification_date: "1971-10-17",
        beatified_by: "Pope Paul VI",
        canonization_date: "1982-10-10",
        canonized_by: "Pope John Paul II",
        canonization_type: "martyr",
        canonization_stage: "saint",
        patronage: ["addicts", "journalists", "prisoners", "families", "pro-life movement"],
        themes: ["martyrs", "marian", "perseverance", "conversion", "missionaries"],
        biography_short: `Rajmund Kolbe was born on January 8, 1894, in Zdunska Wola, in Russian-occupied Poland. His parents were devout Franciscan tertiaries; two of their sons entered religious life. Rajmund joined the Conventual Franciscan novitiate in 1907 and took the name Maximilian. He made his final profession in 1910 and was sent to Rome for studies, earning doctorates in philosophy and theology at the Gregorian and Seraphic universities.

In Rome in October 1917, he founded the Militia Immaculatae — the Knights of the Immaculate — a Marian apostolate aimed at the conversion of sinners and enemies of the Church. It grew into a worldwide movement. He was ordained a priest on April 28, 1918, returned to Poland, and in 1927 founded Niepokalanów — City of the Immaculate — a Franciscan friary near Warsaw that became one of the largest in the world, housing more than 700 brothers and operating a publishing house, radio station, and press that reached hundreds of thousands of readers.

In 1930 he traveled to Japan and founded a monastery near Nagasaki — positioned on the side of a mountain that would shelter it from the atomic bomb fifteen years later. He returned to Poland in 1936 to lead Niepokalanów. When Germany invaded in September 1939, Kolbe and his brothers sheltered thousands of Polish refugees, including Jews. He was arrested by the Gestapo on February 17, 1941, and transferred to Auschwitz on May 28 as prisoner 16670.

In late July 1941, a prisoner escaped and Nazi camp policy required ten men from the same barracks to be starved to death in reprisal. When one of the selected men — Franciszek Gajowniczek, a married father — cried out for his family, Kolbe stepped forward and asked to take his place. The camp commander permitted it. Kolbe and the nine others were locked in an underground bunker without food or water. He led them in prayer and hymns. After two weeks, four men remained alive. On August 14, 1941 — the eve of the Assumption — an SS guard administered lethal phenol injections to those still living, Kolbe among them.

He was beatified by Pope Paul VI on October 17, 1971. At his canonization on October 10, 1982, Pope John Paul II declared Kolbe a martyr of charity, the first person so designated in the modern canonization process. Franciszek Gajowniczek, the man whose place Kolbe had taken, was present at the ceremony.`,
        gender: "male",
        lay_person: false,
        image_url: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Fr.Maximilian_Kolbe_1939.jpg",
        wikipedia_url: "https://en.wikipedia.org/wiki/Maximilian_Kolbe",
        published: true,
      },
      {
        slug: "louis-martin",
        name: "Louis Martin",
        saint_name: "Saint Louis Martin",
        birth_name: "Louis Martin",
        birth_date: "1823-08-22",
        death_date: "1894-07-29",
        feast_day: "July 12",
        nationality: "French",
        beatification_date: "2008-10-19",
        beatified_by: "Pope Benedict XVI",
        canonization_date: "2015-10-18",
        canonized_by: "Pope Francis",
        canonization_type: "married_couple",
        canonization_stage: "saint",
        patronage: ["married couples", "families", "parents", "Catholic families"],
        themes: ["saints-of-everyday-life", "conversion", "perseverance", "hope", "marian"],
        biography_short: `Louis Joseph Aloys Stanislaus Martin was born on August 22, 1823, in Bordeaux, France, the son of a soldier in the post-Napoleonic army. His childhood was spent moving between garrison towns before the family settled in Alençon.

As a young man, Louis sought a life of religious consecration. He applied to enter the monastery of the Canons Regular of the Great Saint Bernard in Switzerland but was refused — he had not learned Latin, a requirement for admission. He returned to France, took up watchmaking, and opened his own shop in Alençon. He was a devoted Catholic: a member of the Third Order of Saint Francis, a regular at daily Mass, a man who spent hours before the Blessed Sacrament. He loved fishing and long pilgrimage walks.

He met Azélie-Marie Guérin on the Pont Saint-Léonard bridge in Alençon. They married on July 13, 1858, at the Basilica of Notre-Dame. Together they had nine children; four died young, including three sons in infancy and a daughter, Marie Hélène, at age five. The five daughters who survived all entered religious life — among them Marie-Françoise-Thérèse, who became Saint Thérèse of Lisieux.

When Zélie died of breast cancer in 1877, Louis sold his business and moved the family to Lisieux in 1882 to be closer to his daughters' religious communities. In his later years he suffered a series of strokes and mental deterioration. From 1889 to 1892 he was cared for at the Bon Sauveur psychiatric institution in Caen — a suffering his daughter Thérèse described as his most painful trial, and one she offered for her own vocation.

He died on July 29, 1894, in Lisieux. He was beatified with Zélie by Pope Benedict XVI on October 19, 2008, and canonized by Pope Francis on October 18, 2015 — the first married couple in the history of the Church to be canonized together.`,
        gender: "male",
        lay_person: true,
        image_url: "https://upload.wikimedia.org/wikipedia/commons/3/38/Louis_Martin_1.jpg",
        wikipedia_url: "https://en.wikipedia.org/wiki/Louis_Martin_and_Marie-Az%C3%A9lie_Gu%C3%A9rin",
        published: true,
      },
      {
        slug: "zelie-martin",
        name: "Zélie Martin",
        saint_name: "Saint Zélie Martin",
        birth_name: "Zelie Guerin Martin",
        birth_date: "1831-12-23",
        death_date: "1877-08-28",
        feast_day: "July 12",
        nationality: "French",
        beatification_date: "2008-10-19",
        beatified_by: "Pope Benedict XVI",
        canonization_date: "2015-10-18",
        canonized_by: "Pope Francis",
        canonization_type: "married_couple",
        canonization_stage: "saint",
        patronage: ["married couples", "families", "parents", "Catholic families"],
        themes: ["saints-of-everyday-life", "conversion", "perseverance", "hope", "marian"],
        biography_short: `Azélie-Marie Guérin was born on December 23, 1831, in Gandelain, a small village near Alençon in Normandy, France. She was baptized on Christmas Eve. Her father was a gendarme; her childhood was marked by strictness and austerity, an atmosphere she later described as joyless. She grew up with a deep faith that she found not through her home but in spite of it.

As a young woman she applied to join the Daughters of Charity in Alençon, hoping for religious life. She was refused — her health, particularly her respiratory condition, was considered insufficient. She accepted the refusal as a sign and turned instead to lacemaking. She taught herself the extraordinarily painstaking technique of Alençon point lace — considered among the most difficult needlework in Europe — and built it into a successful commercial enterprise. She managed orders, correspondence, and a network of home workers while maintaining her own output. She was an astute businesswoman.

She met Louis Martin on the Pont Saint-Léonard bridge in Alençon. They married on July 13, 1858, at the Basilica of Notre-Dame. Both had attempted religious life and been refused; both brought to their marriage an interior life that shaped their household. They had nine children together. Four died young — three sons in infancy and their daughter Marie Hélène at age five. The five daughters who survived all entered religious life. The youngest, Marie-Françoise-Thérèse, became Saint Thérèse of Lisieux.

Zélie managed her lacemaking business until ill health forced her to stop. She was diagnosed with breast cancer and endured its progression for years while continuing to raise her children and correspond with family in hundreds of letters — a rare intimate record of a 19th-century Catholic family. She died on August 28, 1877, in Alençon, at the age of forty-five. Thérèse was four years old.

She was beatified with Louis by Pope Benedict XVI on October 19, 2008, and canonized by Pope Francis on October 18, 2015.`,
        gender: "female",
        lay_person: true,
        image_url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Z%C3%A9lie_Martin_1.jpg",
        wikipedia_url: "https://en.wikipedia.org/wiki/Louis_Martin_and_Marie-Az%C3%A9lie_Gu%C3%A9rin",
        published: true,
      },
      {
        slug: "carlo-acutis",
        published: true,
        name: "Carlo Acutis",
        saint_name: "Saint Carlo Acutis",
        birth_name: "Carlo Acutis",
        birth_date: "1991-05-03",
        death_date: "2006-10-12",
        feast_day: "October 12",
        nationality: "Italian",
        ministry_country: "Italy",
        beatification_date: "2020-10-10",
        beatified_by: "Cardinal Agostino Vallini (Assisi)",
        canonization_date: "2025-09-07",
        canonized_by: "Pope Leo XIV",
        canonization_type: "confessor",
        canonization_stage: "saint",
        patronage: ["computer programmers", "internet users", "youth", "Eucharistic devotion"],
        themes: ["technology", "eucharistic", "conversion", "perseverance", "hope"],
        biography_short: `Carlo Acutis was born on May 3, 1991, in London, where his Italian parents were temporarily living. He was raised in Milan, and from his earliest years showed an unusual spiritual seriousness that coexisted with an entirely ordinary boyhood. He played video games, loved soccer, kept a dog and a cat, and counted among his friends children from the margins of his neighborhood — the homeless, the elderly, the disabled — whom he visited and helped regularly.\n\nHe began attending daily Mass as a young child and spent time in Eucharistic Adoration each day, which he described as the source of everything. He said the Eucharist was his "highway to heaven." He received his First Communion at age seven, earlier than the standard age, after convincing his parish priest that he was ready.\n\nHe taught himself computer programming and web design. At eleven, he began cataloguing authenticated Eucharistic miracles from across the centuries — cases where the consecrated host or wine had undergone visible physical changes confirmed by Church investigation. He built a website that documented these cases with photographs, medical evidence, and sources. He later designed a traveling multimedia exhibition of the same material that has since been displayed in dozens of countries. He never sought recognition for it. He considered himself only a documentarian.\n\nHe was diagnosed with M3 acute promyelocytic leukemia on October 1, 2006. He died eleven days later, on October 12, in Monza. He was fifteen. His last words, according to his mother, were an expression of contentment — that he had given everything to God and kept nothing for himself.\n\nHis body was transferred to Assisi and is displayed in the crypt of the Sanctuary of the Spoliation in a glass reliquary. The display includes a wax layer molded to resemble his living appearance — an Italian tradition also used for other beatified and canonized figures. He wears a tracksuit and sneakers. He was beatified there on October 10, 2020, by Cardinal Agostino Vallini. On September 7, 2025, Pope Leo XIV canonized him in Rome alongside Blessed Pier Giorgio Frassati. He is the first person born in the twentieth century's final decade to be declared a saint.`,
        gender: "male",
        lay_person: true,
        wikipedia_url: "https://en.wikipedia.org/wiki/Carlo_Acutis",
      },
      {
        slug: "juan-diego",
        published: true,
        name: "Juan Diego",
        saint_name: "Saint Juan Diego",
        birth_name: "Juan Diego Cuauhtlatoatzin",
        birth_date: "1474-01-01",
        death_date: "1548-01-01",
        feast_day: "December 9",
        nationality: "Aztec / Indigenous Mexican",
        ministry_country: "Mexico",
        beatification_date: "1990-05-06",
        beatified_by: "Pope John Paul II (equipollent)",
        beatification_miracle_dispensed: true,
        canonization_date: "2002-07-31",
        canonized_by: "Pope John Paul II",
        canonization_type: "confessor",
        canonization_stage: "saint",
        dispensation_reason: "equipollent",
        patronage: ["indigenous peoples of the Americas"],
        themes: ["conversion", "marian", "perseverance", "hope", "saints-of-everyday-life"],
        biography_short: `Juan Diego Cuauhtlatoatzin was born in 1474 at Cuauhtitlan, in the Aztec empire, in the region that is now central Mexico. His birth name in Nahuatl — Cuauhtlatoatzin — has been translated as "the eagle who speaks." He was a member of the Chichimec people and lived as a farmer and mat weaver. He converted to Christianity in the early 1520s, after the Spanish conquest, and was baptized by Franciscan missionaries. He took the Christian name Juan Diego. He was among the earliest indigenous converts in New Spain. He was widowed and devoted himself to his faith, walking fifteen miles each day to attend Mass.\n\nOn December 9, 1531, while on his way to Mass at Tlatelolco, he passed the hill of Tepeyac, north of Mexico City. He heard music and saw a luminous young woman who spoke to him in Nahuatl. She identified herself as the Virgin Mary and asked him to go to Bishop Juan de Zumárraga and request that a chapel be built at Tepeyac, where she promised to show her love and compassion to all who sought her there. The bishop received Juan Diego but asked for a sign before he would act.\n\nMary appeared to Juan Diego again on December 12. She told him that his uncle Juan Bernardino — whom he had been trying to reach to find a priest for, believing him near death from illness — had been healed. She directed Juan Diego to the top of Tepeyac hill, where he found Castilian roses blooming out of season in the cold December earth. He gathered them in his tilma — the coarse cactus-fiber cloak worn by men of his class — and carried them to the bishop. When he opened the tilma before Zumárraga, the roses fell to the floor and the image of the Virgin was found imprinted on the cloth.\n\nThe tilma still exists. It is displayed behind glass at the Basilica of Our Lady of Guadalupe in Mexico City, which stands near the base of Tepeyac Hill. The cactus-fiber fabric has not decayed in nearly five centuries. Scientific examinations have found no evidence of brush strokes, no underdrawing, and no sizing on the fibers. It remains the most visited Marian shrine in the world.\n\nJuan Diego spent the last seventeen years of his life in a small hut near the chapel at Tepeyac, caring for pilgrims. He died in 1548. His veneration was formally approved in 1663. He was beatified equipollently by Pope John Paul II on May 6, 1990, and canonized on July 31, 2002 — the first indigenous saint of the Americas canonized in the modern era.`,
        gender: "male",
        lay_person: true,
        image_url: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Juan-Diego.jpg",
        wikipedia_url: "https://en.wikipedia.org/wiki/Juan_Diego",
      },
    ])
    .returning({ id: schema.saints.id, slug: schema.saints.slug });

  console.log(`Inserted ${insertedSaints.length} saints.`);

  const saintId = (slug: string) => {
    const s = insertedSaints.find((r) => r.slug === slug);
    if (!s) throw new Error(`Saint not found: ${slug}`);
    return s.id;
  };

  console.log("Seeding saint relations...");

  await db.insert(schema.saintRelations).values([
    {
      saint_id: saintId("louis-martin"),
      related_saint_id: saintId("zelie-martin"),
      relation_type: "canonized_together",
    },
    {
      saint_id: saintId("zelie-martin"),
      related_saint_id: saintId("louis-martin"),
      relation_type: "canonized_together",
    },
  ]);

  console.log("Seeding miracles...");

  const insertedMiracles = await db
    .insert(schema.miracles)
    .values([
      // ── John Paul II ──────────────────────────────────────────────────────────
      {
        slug: "healing-of-sr-marie-simon-pierre",
        published: true,
        title: "Healing of Sr. Marie Simon-Pierre",
        miracle_category: "intercessory",
        type: "healing",
        topics: [],
        date_of_event: "2005-06-02",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Aix-en-Provence",
        location_lat: "43.5298424",
        location_lng: "5.4474738",
        country: "France",
        recipient_name: "Sr. Marie Simon-Pierre",
        recipient_gender: "female",
        recipient_country: "France",
        recipient_privacy: "public",
        recipient_age_at_event: 44,
        recipient_age_approximate: true,
        medical_diagnosis: "Parkinson's disease (diagnosed 2001)",
        cure_details:
          "Severe Parkinson's — could not write or drive. On the night of June 2, she felt compelled to write JPII's name and found her hand steady. Complete recovery.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        medical_verification_date: "2009-01-01",
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_decree_date: "2011-01-14",
        vatican_medical_board_verdict: "Declared medically inexplicable; miracle decree promulgated January 14, 2011",
        used_for_beatification: true,
        used_for_canonization: false,
        synopsis: `Sister Marie Simon-Pierre Normand was a French nun with the Congregation of the Little Sisters of Catholic Motherhood. In 2001, at the age of thirty-nine, she was diagnosed with Parkinson's disease — the same illness that had visibly consumed Pope John Paul II in his final years.

By 2005 her condition had deteriorated significantly. The tremors in her left hand had spread. She could no longer drive, could barely write, and struggled to perform the basic duties of her work. Her superior described her handwriting as nearly illegible. Other sisters in her congregation were praying for John Paul II's intercession on her behalf, though Marie Simon-Pierre initially resisted — she felt the connection between her illness and his was too close, almost presumptuous.

John Paul II died on April 2, 2005. Two months later, on the evening of June 2, her superior asked her again to write John Paul II's name as a prayer — a simple act of petition. She complied reluctantly. Her hand was steady. The tremor was gone.

She slept that night and woke the following morning with no symptoms. She was examined by her doctors, who found no clinical trace of the disease. The neurological deterioration that had been progressing for four years had stopped and reversed. She returned to full nursing duties within weeks.

The case was submitted to the Vatican's Consulta Medica, the independent panel of physicians that evaluates miracle claims for the Holy See. After exhaustive review, the board declared in 2009 that her healing was medically inexplicable — spontaneous, complete, and lasting, with no scientific explanation consistent with the natural course of Parkinson's disease. Pope Benedict XVI recognized the miracle, and Sr. Marie Simon-Pierre's healing became the basis for John Paul II's beatification on May 1, 2011.

She has spoken publicly about the experience many times since, including at the beatification ceremony itself. She has described the moment not as dramatic or overwhelming, but quiet — a stillness where there had been trembling.`,
        has_primary_sources: true,
      },
      {
        slug: "healing-of-floribeth-mora-diaz",
        published: true,
        title: "Healing of Floribeth Mora Diaz",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["mothers"],
        date_of_event: "2011-05-01",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Costa Rica (home)",
        location_lat: "9.9327707",
        location_lng: "-84.0796144",
        country: "Costa Rica",
        recipient_name: "Floribeth Mora Diaz",
        recipient_gender: "female",
        recipient_country: "Costa Rica",
        recipient_privacy: "public",
        medical_diagnosis: "Severe brain aneurysm (diagnosed April 2011, terminal, sent home to die)",
        cure_details:
          "While watching JPII's beatification on TV, she heard his voice say \"Don't be afraid. I am with you.\" She felt immediate improvement.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        medical_verification_date: "2013-01-01",
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable in 2013",
        used_for_beatification: false,
        used_for_canonization: true,
        synopsis: `Floribeth Mora Díaz was a Costa Rican woman and mother of four. In April 2011, at the age of forty-nine, she was diagnosed with a cerebral aneurysm — an abnormal bulge in an artery wall in the brain. Her doctors at the Hospital de la Mujer in San José delivered a stark assessment: the aneurysm was inoperable, treatment was not feasible, and she had approximately one month to live. She was sent home.

On May 1, 2011, she lay in bed watching the televised broadcast of John Paul II's beatification ceremony in Rome. She had a magazine beside her — a special edition featuring John Paul II's image on the cover. Her family had been praying for his intercession, though she had little hope left. At the moment when Pope Benedict XVI proclaimed the beatification, she heard a voice. She later described it as clear and calm: "Get up. Don't be afraid. I am with you."

She rose from bed. The debilitating headaches that had accompanied her condition were gone. She felt, by her own account, completely well. Her family, expecting her death within weeks, found her standing.

Her subsequent medical examinations showed no trace of the aneurysm. The imaging that had documented the lesion showed nothing. Her neurologists, who had given her weeks to live, could not explain the resolution of a condition that does not resolve on its own.

The case was referred to the Vatican's Consulta Medica, which reviewed the full medical record and concluded in 2013 that the healing was instantaneous, complete, and beyond medical explanation. Pope Francis recognized the miracle, and Floribeth Mora Díaz was present at St. Peter's Square on April 27, 2014, when John Paul II was canonized — the miracle that made his canonization possible having happened to her.

She has since traveled internationally to speak about her experience and has met multiple times with Pope Francis.`,
        has_primary_sources: true,
      },

      // ── Mother Teresa ─────────────────────────────────────────────────────────
      {
        slug: "healing-of-monica-besra",
        published: true,
        title: "Healing of Monica Besra",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["mothers", "financial-hardship"],
        date_of_event: "1998-09-05",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Nadia district, West Bengal",
        location_lat: "23.4847374",
        location_lng: "88.5567067",
        country: "India",
        region: "West Bengal",
        recipient_name: "Monica Besra",
        recipient_gender: "female",
        recipient_country: "India",
        recipient_privacy: "public",
        medical_diagnosis: "Large abdominal tumor with concurrent abdominal tuberculosis (treated since 1997)",
        cure_details:
          "After applying a medallion of Mother Teresa and praying, she felt intense warmth and the tumor disappeared.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        medical_verification_date: "2002-01-01",
        intercessory_medium: "medallion",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable in 2002",
        used_for_beatification: true,
        used_for_canonization: false,
        synopsis: `Monica Besra was a tribal woman from the Nadia district of West Bengal, India. In 1998 she was suffering from a large abdominal tumor — described in medical records as a benign ovarian or abdominal mass — as well as tuberculosis and meningitis. She had been receiving treatment at a clinic run by the Missionaries of Charity, but her condition had not improved. By the first anniversary of Mother Teresa's death, she was severely ill.

On the night of September 5, 1998 — the exact anniversary of Mother Teresa's death — sisters at the mission placed a medallion that had been touched to Mother Teresa's body against Monica Besra's abdomen and prayed. Monica Besra later described feeling an intense light and warmth emanating from the medallion. By morning, the tumor was gone.

Her physicians, who had documented the mass, examined her and found no trace of it. The sudden and complete disappearance of the tumor had no medical explanation consistent with its prior diagnosis or the absence of any intervening treatment.

The case was investigated by the Vatican's Consulta Medica, which concluded in 2002 that the healing was medically inexplicable. Pope John Paul II recognized the miracle, and it served as the basis for Mother Teresa's beatification on October 19, 2003.

The case attracted significant public controversy, particularly from Monica Besra's husband and some of her treating physicians, who attributed her recovery to conventional medical treatment. The Vatican's position, following its standard process of independent medical review, was that the available evidence did not support that conclusion.

Monica Besra has consistently maintained that she was healed through Mother Teresa's intercession. She was present at the beatification ceremony in Rome.`,
        has_primary_sources: true,
      },
      {
        slug: "healing-of-marcilio-haddad-andrino",
        published: true,
        title: "Healing of Marcilio Haddad Andrino",
        miracle_category: "intercessory",
        type: "healing",
        topics: [],
        date_of_event: "2008-12-09",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Santos",
        location_lat: "-23.9609448",
        location_lng: "-46.3166316",
        country: "Brazil",
        region: "Sao Paulo",
        recipient_name: "Marcilio Haddad Andrino",
        recipient_gender: "male",
        recipient_country: "Brazil",
        recipient_privacy: "public",
        medical_diagnosis: "Multiple brain abscesses / viral meningoencephalitis with hydrocephalus",
        cure_details:
          "In a coma, on life support, family told to prepare for his death. His wife prayed with a relic. Doctors found him conscious the next morning with all symptoms gone.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        medical_verification_date: "2015-01-01",
        intercessory_medium: "relic",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable in 2015",
        used_for_beatification: false,
        used_for_canonization: true,
        synopsis: `Marcilio Haddad Andrino was a Brazilian man from Santos, in the state of São Paulo. In December 2008 he was admitted to hospital in a critical condition. He had developed multiple brain abscesses and viral meningoencephalitis — a severe infection of the brain and its surrounding membranes — complicated by hydrocephalus, an abnormal accumulation of fluid in the brain. He was placed on life support, slipped into a coma, and his physicians told his family to prepare for his death.

His wife, Fernanda, did not accept that prognosis. She obtained a relic of Mother Teresa and, on the night of December 9, 2008, gathered with family members to pray beside his bed, placing the relic against him and asking for Mother Teresa's intercession.

The following morning, December 10, Marcilio regained consciousness. His doctors, who had considered his death imminent, found him alert and responsive. Over the days that followed his condition improved rapidly and without medical explanation. He was eventually discharged from hospital with no lasting neurological damage — an outcome his physicians could not account for given the severity of his initial presentation.

The case was submitted to the Vatican's Consulta Medica. After extensive review of the medical record, the board concluded in 2015 that the healing was instantaneous, complete, and medically inexplicable. Pope Francis recognized the miracle, making it the basis for Mother Teresa's canonization on September 4, 2016.

Marcilio and Fernanda Andrino attended the canonization ceremony in Rome, where they met Pope Francis.`,
        has_primary_sources: true,
      },

      // ── Padre Pio ─────────────────────────────────────────────────────────────
      {
        slug: "healing-of-consiglia-de-martino",
        title: "Healing of Consiglia De Martino",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["mothers"],
        date_of_event: "1995-11-03",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Salerno",
        location_lat: "40.682400",
        location_lng: "14.768100",
        country: "Italy",
        region: "Campania",
        recipient_name: "Consiglia De Martino",
        recipient_gender: "female",
        recipient_country: "Italy",
        recipient_privacy: "public",
        medical_diagnosis: "Traumatic rupture of the thoracic duct with accumulation of approximately 2 liters of lymphatic fluid in the neck",
        cure_details:
          "On October 31, 1995, De Martino developed acute pain and a rapidly growing lump below her left collarbone in Salerno. CT scans confirmed a ruptured thoracic duct with approximately 2 liters of lymphatic fluid accumulated in her neck. Complex thoracic surgery was scheduled for November 3. Between November 2 and 3, with no medical treatment administered, the lump disappeared completely. Pre-surgery examination confirmed total resolution; surgery was cancelled. Fra Modestino Fucci had prayed at Padre Pio's tomb on her behalf.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        medical_verification_date: "1998-04-30",
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_decree_date: "1998-12-21",
        vatican_medical_board_verdict: "Vatican Medical Committee (5/5) declared healing scientifically inexplicable on April 30, 1998",
        used_for_beatification: true,
        used_for_canonization: false,
        synopsis: `Consiglia De Martino was a married woman with three children living in Salerno, Italy. On October 31, 1995, she began to feel acute pain in her chest, followed by the rapid growth of a large mass below her left collarbone. By the time her husband drove her to the Riuniti Hospital in Salerno, the swelling had reached the size of a grapefruit. Physicians ordered two CT scans and confirmed the diagnosis: a traumatic rupture of the thoracic duct, the largest vessel in the lymphatic system. Approximately two liters of lymphatic fluid had accumulated in her neck and chest. Complex thoracic surgery was scheduled for the morning of November 3.

While Consiglia was hospitalized, word was sent to the friary at San Giovanni Rotondo. Fra Modestino Fucci, a Capuchin friar who had known Padre Pio personally, went to pray at his tomb. Consiglia herself prayed to Padre Pio throughout her time in the hospital and reported smelling, on several occasions, the distinctive fragrance that many of Padre Pio's devotees associate with his intercession.

On November 2, she noticed a marked and sudden decrease in pain. The swelling began to diminish. By the morning of November 3, when surgeons arrived to prepare her for the operation, the pre-surgical examination revealed that the lump had disappeared entirely. X-rays confirmed: the thoracic duct rupture had resolved completely, the two liters of lymphatic fluid had been absorbed without trace, and there were no residual deposits in her neck or abdomen. Surgery was cancelled. She was discharged on November 6 without having received any treatment for the condition.

The case was submitted to the Congregation for the Causes of Saints. The diocesan inquiry ran from July 1996 to June 1997, with medical experts unanimously declaring the cure extraordinary and scientifically inexplicable. On April 30, 1998, the Vatican's Medical Committee — five members, voting five to zero — confirmed that the healing was scientifically inexplicable. The Theological Committee unanimously classified it as a miracle on June 22, 1998. Pope John Paul II issued the formal decree on December 21, 1998, and Padre Pio was beatified on May 2, 1999.`,
        has_primary_sources: true,
        published: true,
      },
      {
        slug: "healing-of-matteo-pio-colella",
        title: "Healing of Matteo Pio Colella",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["children"],
        date_of_event: "2000-01-20",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "posthumous",
        location_name: "San Giovanni Rotondo",
        location_lat: "41.7069106",
        location_lng: "15.7288455",
        country: "Italy",
        region: "Apulia",
        recipient_name: "Matteo Pio Colella",
        recipient_gender: "male",
        recipient_country: "Italy",
        recipient_privacy: "public",
        recipient_age_at_event: 7,
        medical_diagnosis: "Fulminant meningococcal meningitis with septic shock, cardiac arrest requiring resuscitation, and coma",
        cure_details:
          "On January 20, 2000, seven-year-old Matteo developed high fever, purple spots, and rapidly deteriorated into septic shock with cardiac arrest requiring resuscitation and mechanical ventilation. Physicians stated he would die within hours and last rites were administered. His mother prayed at Padre Pio's nearby tomb. On January 27, Matteo emerged from the coma; a CT scan showed no brain lesions. He was fully recovered by February 6. During the coma he reported seeing an elderly man in a brown habit whom his mother identified as Padre Pio.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        medical_verification_date: "2001-11-22",
        intercessory_medium: "tomb_prayer",
        vatican_recognized: true,
        vatican_decree_date: "2002-02-01",
        vatican_medical_board_verdict: "Vatican Medical Committee unanimously declared healing quick, complete, lasting, without consequences, and scientifically inexplicable (November 22, 2001)",
        used_for_beatification: false,
        used_for_canonization: true,
        synopsis: `Matteo Pio Colella was born on December 4, 1992, in San Giovanni Rotondo — the town where Padre Pio had lived, and where his tomb now draws pilgrims from around the world. On January 20, 2000, when Matteo was seven years old, he developed a sudden high fever exceeding 104°F, followed by weakness, headache, vomiting, and mental disorientation. Purple spots began to spread across his body — a sign of septicemia. He was rushed to hospital.

His condition deteriorated rapidly. He went into septic shock. His heart stopped and required resuscitation. He was placed on mechanical ventilation and fell into a coma. His organs began to fail. The attending physician told the family that the comatose child would die within hours. Last rites were administered.

His mother, Lucia, left the hospital and walked to the nearby sanctuary of Padre Pio. She knelt at his tomb and prayed.

On January 27 — seven days after the onset of illness — Matteo emerged from the coma. A CT scan performed the same day showed no brain lesions, no neurological damage. He was fully recovered by February 6 and was discharged from hospital without any residual impairment. Doctors who had declared him dying could offer no explanation for what had happened.

During his coma, Matteo later reported, he had seen an elderly man with a white beard dressed in a brown habit who told him he would be well. His mother, when he described the figure, recognized the description immediately as Padre Pio.

The diocesan process opened on June 11, 2000 and concluded on October 17, 2001. On November 22, 2001, the Vatican's Medical Committee unanimously declared the healing quick, complete, lasting, without neurological consequences, and scientifically inexplicable. Pope John Paul II issued the decree in February 2002, and Padre Pio was canonized on June 16, 2002.`,
        has_primary_sources: true,
        published: true,
      },
      {
        slug: "stigmata-of-padre-pio",
        title: "The Stigmata of Padre Pio",
        miracle_category: "associated",
        type: "stigmata",
        topics: [],
        date_of_event: "1918-09-20",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "during_lifetime",
        location_name: "San Giovanni Rotondo",
        location_lat: "41.7069106",
        location_lng: "15.7288455",
        country: "Italy",
        recipient_gender: "not_applicable",
        recipient_privacy: "not_applicable",
        region: "Apulia",
        cure_details:
          "On September 20, 1918, Padre Pio received permanent visible stigmata on his hands, feet, and side while praying in the choir loft after Mass. The wounds bled continuously for fifty years without infection or natural healing, were examined by multiple physicians and Vatican commissions, and disappeared completely at his death on September 23, 1968, leaving no scars. He was the first Catholic priest known to bear the stigmata.",
        cure_characteristics: "not_applicable",
        was_medically_verified: true,
        intercessory_medium: "not_applicable",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Vatican commission (1925) declared wounds not of natural origin; multiple physicians including Dr. Luigi Romanelli and Dr. Giorgio Festa found wounds medically inexplicable",
        used_for_beatification: false,
        used_for_canonization: false,
        synopsis: `On September 20, 1918, Padre Pio was making his thanksgiving after Mass in the choir loft of the Church of Our Lady of Grace in San Giovanni Rotondo. While praying before a crucifix, he fell into a state of ecstasy. When he returned to himself, he found that his hands, feet, and the left side of his chest bore open, bleeding wounds corresponding to the five wounds of Christ's Passion. He had experienced a transient, invisible stigmata two years earlier; this time the wounds were permanent and visible. He would carry them for fifty years, until the day of his death.

The wounds attracted immediate attention from Church authorities and physicians. Dr. Luigi Romanelli, chief surgeon at the hospital in Barletta, examined Padre Pio five times between May 1919 and July 1920. He described the wounds as "deep, bleeding, without infection or signs of healing" and stated: "I cannot find a clinical formulation that allows me to classify these wounds." Dr. Giorgio Festa, examining independently and later alongside Romanelli, found the wounds neither healed nor showed the ordinary signs of tissue decay; he concluded they were not self-inflicted and were medically inexplicable. Over the following decades, additional physicians were dispatched by the Holy Office and by Rome — among them Dr. Amico Bignami and Dr. Agostino Gemelli. No consistent natural explanation emerged from any examination.

The wounds bled continually and were associated with a pronounced floral fragrance that witnesses described as a scent of flowers or incense, which Padre Pio did not use and made no effort to explain. In 1925, a formal Vatican commission examined the stigmata and concluded that the wounds were not of natural origin.

On September 23, 1968 — three days after the fiftieth anniversary of the stigmata — Padre Pio died. At the time of death, witnesses and physicians noted that the wounds on his hands and feet had closed completely and left no scarring, no thickened skin, no residual marks of any kind. Physicians who examined the body found no trace that the wounds had ever existed.

He was the first Catholic priest in the history of the Church known to bear the stigmata.`,
        has_primary_sources: true,
        published: true,
      },
      {
        slug: "bilocation-of-padre-pio",
        title: "Bilocation of Padre Pio",
        miracle_category: "associated",
        type: "bilocation",
        topics: [],
        date_precision: "unknown",
        timing_relative_to_saint_death: "during_lifetime",
        location_name: "San Giovanni Rotondo",
        location_lat: "41.7069106",
        location_lng: "15.7288455",
        country: "Italy",
        region: "Apulia",
        recipient_gender: "not_applicable",
        recipient_privacy: "not_applicable",
        cure_details:
          "Throughout his ministry (1918–1968), Padre Pio was reported by numerous witnesses to appear simultaneously in two locations — physically at San Giovanni Rotondo while being seen elsewhere. Accounts included General Luigi Cadorna (WWI, 1917), American bomber pilots over San Giovanni Rotondo during WWII, and numerous deathbed appearances. Documented in the Vatican Positio for his beatification cause.",
        cure_characteristics: "not_applicable",
        was_medically_verified: false,
        intercessory_medium: "not_applicable",
        vatican_recognized: true,
        used_for_beatification: false,
        used_for_canonization: false,
        synopsis: `Throughout his fifty years at San Giovanni Rotondo, Padre Pio was the subject of numerous accounts in which he was reported to appear simultaneously in two distinct locations — physically present at his friary in Apulia while being seen, heard, or touched by witnesses elsewhere. The accounts span continents and decades, from wartime Europe to the deathbeds of the dying. The phenomenon was documented in the Vatican's Positio — the official dossier prepared for his beatification — and was among the extraordinary events formally considered in his cause for canonization.

Two accounts are among the most frequently cited. The first involves General Luigi Cadorna, Supreme Commander of the Italian Army, on the night of November 9, 1917. Following Italy's catastrophic defeat at Caporetto and his removal from command, Cadorna had locked himself in his quarters in Treviso and was preparing to take his own life. He later reported that a young Capuchin friar entered the room without being admitted, spoke to him, and persuaded him to abandon the act. Three years later, Cadorna visited the friary at San Giovanni Rotondo. When Padre Pio approached, the general recognized him immediately as the friar from that night. Padre Pio reportedly greeted him with: "We had a very bad night that night, General."

The second account comes from World War II. American bomber pilots assigned to strike San Giovanni Rotondo reported that when they arrived over the city, a brown-robed friar appeared in the air before their aircraft and the bombs could not be released. When an American airbase was later established at Foggia, several miles away, one of the pilots visited the friary and identified Padre Pio as the figure he had seen in the sky.

Padre Pio himself rarely spoke of these events and consistently directed the accounts of others away from himself.`,
        has_primary_sources: true,
        published: true,
      },

      // ── Faustina Kowalska ─────────────────────────────────────────────────────
      {
        slug: "healing-of-maureen-digan",
        title: "Healing of Maureen Digan",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["mothers"],
        date_of_event: "1981-03-13",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Divine Mercy Shrine, Krakow-Lagiewniki",
        location_lat: "50.054700",
        location_lng: "19.935100",
        country: "Poland",
        region: null,
        recipient_name: "Maureen Digan",
        recipient_gender: "female",
        recipient_country: "USA",
        recipient_privacy: "public",
        medical_diagnosis: "Chronic lymphedema (36 years; severe bilateral leg swelling, unable to walk)",
        cure_details:
          "While praying at Faustina's tomb in Krakow-Lagiewniki, felt a sudden draining sensation in her legs. The chronic swelling resolved immediately and she was able to walk. Her husband Bob was present and witnessed the healing.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        medical_verification_date: "1992-01-01",
        intercessory_medium: "tomb_prayer",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable by the Consulta Medica (1992); accepted as beatification miracle",
        used_for_beatification: true,
        used_for_canonization: false,
        published: true,
        synopsis: `Maureen Digan was an American woman from Fall River, Massachusetts, who had lived with chronic lymphedema for thirty-six years. Lymphedema is a condition in which damage or obstruction to the lymphatic system causes fluid to accumulate in the soft tissues, producing chronic, progressive swelling — in her case severe enough that she could not walk. The condition had no cure. Medical management could slow its progression but not reverse it.\n\nIn March 1981, Maureen and her husband Bob traveled to Poland to visit the tomb of Sister Faustina Kowalska, whose beatification cause was then under investigation. Faustina had died in Kraków in 1938; her remains were interred at the chapel of the Sisters of Our Lady of Mercy in Kraków-Łagiewniki. On March 13, 1981, while Maureen was praying at the tomb, she felt something change. She described a sensation in her legs — a cracking or loosening — followed by the rapid draining of the fluid that had swollen them for decades. She stood up and walked. Her husband was present and witnessed what happened.\n\nShe returned to the United States. Her physicians examined her and could not account for the resolution of a condition that had been present and documented for thirty-six years. The case was submitted to the Vatican. In 1992, the Holy See's medical board reviewed the documentation and declared the healing medically inexplicable. It was accepted as the miracle for Faustina's beatification.\n\nFaustina Kowalska was beatified by Pope John Paul II on April 18, 1993.`,
        has_primary_sources: true,
      },
      {
        slug: "healing-of-fr-ronald-pytel",
        title: "Healing of Fr. Ronald Pytel",
        miracle_category: "intercessory",
        type: "healing",
        topics: [],
        date_of_event: "1995-10-01",
        date_precision: "month",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Baltimore, Maryland",
        location_lat: "39.2908816",
        location_lng: "-76.6107590",
        country: "USA",
        region: "Maryland",
        recipient_name: "Fr. Ronald Pytel",
        recipient_gender: "male",
        recipient_country: "Poland",
        recipient_privacy: "public",
        medical_diagnosis: "Advanced arteriosclerotic heart disease with severe angina; bypass surgery recommended",
        cure_details:
          "On the feast day of Blessed Faustina (October 5, 1995) he prayed for her intercession. His cardiac symptoms resolved and follow-up testing found no evidence of the arteriosclerotic disease previously documented. Bypass surgery was no longer required.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        medical_verification_date: "1999-01-01",
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable by the Consulta Medica (1999); accepted as canonization miracle",
        used_for_beatification: false,
        used_for_canonization: true,
        published: true,
        synopsis: `Father Ronald Pytel was a Polish-born priest serving in Baltimore, Maryland. In 1995 he was diagnosed with advanced arteriosclerotic heart disease — a condition in which the arterial walls thicken and harden due to the buildup of plaques, restricting blood flow to the heart. His condition had progressed to the point where he was experiencing severe angina and his cardiologist recommended coronary bypass surgery. The prognosis without intervention was poor.\n\nOn October 5, 1995 — the feast day of Blessed Faustina Kowalska, who had been beatified two years earlier — Father Pytel participated in celebrations marking the anniversary of her death and prayed for her intercession regarding his condition.\n\nIn the period following, his symptoms resolved. Follow-up cardiac testing found no evidence of the arteriosclerotic disease that had been documented and that his physicians had considered severe enough to require surgery. His heart appeared normal. His cardiologist could not explain the findings in light of the prior documentation.\n\nThe case was submitted to the Vatican as part of the investigation into Faustina's canonization. In 1999, the Holy See's medical board reviewed the documentation and declared the healing medically inexplicable. The theological commission concurred. The miracle was approved by Pope John Paul II.\n\nFaustina Kowalska was canonized on April 30, 2000. At the same ceremony, John Paul II established Divine Mercy Sunday as a feast of the universal Church — the first Sunday after Easter — fulfilling one of the central requests Faustina had recorded in her diary.`,
        has_primary_sources: true,
      },
      {
        slug: "divine-mercy-revelations",
        title: "Divine Mercy Revelations to St. Faustina",
        miracle_category: "associated",
        type: "apparition",
        topics: [],
        date_of_event: "1931-02-22",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "during_lifetime",
        location_name: "Płock, Vilnius, and Kraków (convents)",
        location_lat: "50.054700",
        location_lng: "19.935100",
        country: "Poland",
        recipient_name: "St. Faustina Kowalska",
        recipient_gender: "female",
        recipient_country: "Poland",
        recipient_privacy: "public",
        cure_details:
          "Beginning February 22, 1931, Jesus appeared to Faustina with two rays of light (red and white) from his heart, instructing her to commission an image bearing the words \"Jesus, I trust in You\" and establish a Feast of Divine Mercy. Over 1931–1938 she received the Chaplet of Divine Mercy and over 600 pages of recorded visions and locutions. The devotion was approved and Divine Mercy Sunday established for the universal Church at her canonization in 2000.",
        cure_characteristics: "not_applicable",
        was_medically_verified: false,
        intercessory_medium: "not_applicable",
        vatican_recognized: true,
        vatican_decree_date: "2000-04-30",
        used_for_beatification: false,
        used_for_canonization: false,
        published: true,
        synopsis: `On the night of February 22, 1931, Sister Faustina Kowalska was in her cell at the convent in Płock, Poland, when she saw Jesus standing before her clothed in white. From his heart, two rays of light extended outward — one red, one white, representing, she was told, the blood and water that had flowed from his side on the cross. He instructed her to have an image painted of this vision and to have written beneath it the words "Jesus, I trust in You." He asked for the establishment of a Feast of Divine Mercy on the Sunday after Easter, and promised extraordinary graces to those who approached the sacraments on that day with trust in God's mercy.\n\nThis was the beginning of a series of mystical experiences that continued for seven years, across three convents and under the spiritual direction of several priests, most significantly Father Michał Sopoćko in Vilnius. In 1935, Faustina received the Chaplet of Divine Mercy — a prayer sequence said on rosary beads — which Sopoćko helped her commit to writing. She also recorded visions of heaven, purgatory, and hell; detailed instructions for the image and the feast; and an account of Jesus commissioning her as the "Secretary of Divine Mercy," tasked with making his mercy known to the world.\n\nShe wrote all of it down. The diary grew to more than six hundred pages of careful, sometimes vivid prose, written in the ordinary notebooks of a working sister over years of illness, doubt, and opposition from those around her. She was not a theologian, had no formal education beyond what the convent provided, and was frequently dismissed by those who found her claims implausible. She accepted this without apparent bitterness.\n\nAfter her death in 1938, the diary circulated among Polish clergy. In 1959 it was placed on a Holy Office restricted list, principally due to concerns about errors in Italian and French translations. A thorough theological review of the original Polish text, undertaken by Polish bishops, found no doctrinal problems. The restrictions were lifted. Pope John Paul II, who had encountered Faustina's spirituality during his years as a priest and then bishop in Kraków, became the central figure in rehabilitating and promoting the devotion. He beatified her in 1993 and canonized her in 2000. At the canonization, he formally established Divine Mercy Sunday for the universal Church — fulfilling in the official liturgical calendar what Faustina had first written down in a Polish convent notebook sixty-nine years earlier.`,
        has_primary_sources: true,
      },

      // ── Gianna Beretta Molla ───────────────────────────────────────────────────
      {
        slug: "healing-of-lucia-sylvia-cirilo",
        title: "Healing of Lucia Sylvia Cirilo",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["mothers", "pregnancy-and-childbirth"],
        date_of_event: "1977-11-09",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Saint Francis of Assisi Hospital, Grajau",
        location_lat: "-5.8154034",
        location_lng: "-46.1361454",
        country: "Brazil",
        region: "Maranhao",
        recipient_name: "Lucia Sylvia Cirilo",
        recipient_gender: "female",
        recipient_country: "Brazil",
        recipient_privacy: "public",
        medical_diagnosis: "Recto-vaginal fistula (after stillbirth on October 22, 1977; hospital unequipped to treat)",
        cure_details:
          "After a stillbirth, Cirilo developed a severe recto-vaginal fistula. The hospital could not treat it and she was told she needed to be transferred, but believed she would not survive the trip. A nurse, Sister Bernardina de Manaus, prayed for Gianna's intercession. The next morning, Cirilo's pain had vanished and the fistula had healed completely without surgery.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable",
        used_for_beatification: true,
        used_for_canonization: false,
        synopsis: LOREM_SYNOPSIS,
        has_primary_sources: true,
      },
      {
        slug: "healing-of-elizabeth-comparini-arcolino",
        title: "Healing of Elizabeth Comparini Arcolino",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["pregnancy-and-childbirth", "mothers", "children", "pro-life"],
        date_of_event: "2000-01-01",
        date_precision: "year",
        timing_relative_to_saint_death: "posthumous",
        country: "Brazil",
        recipient_name: "Elizabeth Comparini Arcolino",
        recipient_gender: "female",
        recipient_country: "Brazil",
        recipient_privacy: "public",
        medical_diagnosis:
          "Placental tear at 16 weeks of pregnancy, complete loss of amniotic fluid; doctors said child's survival impossible",
        cure_details:
          "At 16 weeks pregnant, Arcolino sustained a tear in her placenta that drained all amniotic fluid. Doctors told her the child had no chance of survival. She prayed for Gianna's intercession and delivered a healthy baby girl, Gianna Maria, via C-section. The recovery was deemed medically inexplicable.",
        cure_characteristics: "gradual_complete",
        was_medically_verified: true,
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable",
        used_for_beatification: false,
        used_for_canonization: true,
        synopsis: LOREM_SYNOPSIS,
        has_primary_sources: true,
      },

      // ── Kateri Tekakwitha ─────────────────────────────────────────────────────
      {
        slug: "healing-of-native-american-boy",
        title: "Healing of an Unnamed Native American Boy",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["children", "native-and-indigenous"],
        date_of_event: "1940-01-01",
        date_precision: "decade",
        timing_relative_to_saint_death: "posthumous",
        country: "USA",
        recipient_gender: "male",
        recipient_country: "USA",
        recipient_privacy: "confidential",
        medical_diagnosis: "Severe illness (records not publicly disclosed)",
        cure_details: "Family prayed for Kateri's intercession. Boy recovered in a manner physicians could not explain. Case accepted by the Congregation for the Causes of Saints for Kateri's beatification.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        used_for_beatification: true,
        used_for_canonization: false,
        published: true,
        synopsis: `The beatification miracle accepted for Kateri Tekakwitha involved the healing of a Native American boy in the United States, believed to have occurred sometime in the 1940s or 1950s. The details of the case — the boy's identity, his specific illness, the circumstances of the prayer, and the medical documentation — have not been made public by the Vatican or by the boy's family.\n\nWhat is known is that the healing was submitted to the Congregation for the Causes of Saints as part of Kateri's beatification cause, that it was reviewed by the Holy See's medical consultors, and that it was accepted as meeting the canonical requirements for a miracle: spontaneous, complete, lasting, and scientifically inexplicable at the time of evaluation.\n\nThe confidentiality of this case is not unusual for older beatification miracles, particularly those involving private individuals or families who did not consent to public identification. The Vatican's beatification process requires rigorous documentation internally, but public disclosure of the recipient's identity and diagnosis has never been mandatory.\n\nKateri Tekakwitha was beatified by Pope John Paul II on June 22, 1980.`,
        has_primary_sources: false,
      },
      {
        slug: "healing-of-jake-finkbonner",
        title: "Healing of Jake Finkbonner",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["children", "native-and-indigenous"],
        date_of_event: "2006-02-01",
        date_precision: "month",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Ferndale, Washington",
        location_lat: "48.8466698",
        location_lng: "-122.5897230",
        country: "USA",
        region: "Washington",
        recipient_name: "Jake Finkbonner",
        recipient_gender: "male",
        recipient_country: "USA",
        recipient_privacy: "public",
        recipient_age_at_event: 6,
        medical_diagnosis: "Necrotizing fasciitis (Group A Streptococcus) following facial laceration",
        cure_details:
          "Infection advanced rapidly up the face toward the skull despite multiple surgical debridements. Family prayed for Kateri's intercession and applied her relic. Infection arrested inexplicably; Jake recovered with far less scarring than physicians had anticipated.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        intercessory_medium: "relic",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable by the Consulta Medica; approved by Pope Benedict XVI in 2011",
        used_for_beatification: false,
        used_for_canonization: true,
        published: true,
        synopsis: `Jake Finkbonner was a six-year-old boy and member of the Lummi Nation, living in Ferndale, Washington, in the northwest corner of the state near the Canadian border. In February 2006, he was playing basketball when he fell and struck his lip on the edge of the court. The cut was small. Within days, it had become something far worse.\n\nGroup A Streptococcus bacteria entered the wound and progressed to necrotizing fasciitis — a rapidly advancing bacterial infection that destroys soft tissue as it spreads, following the fascial planes that connect muscle and skin. The infection moved up his face toward his skull. Surgeons at Seattle Children's Hospital operated to remove infected tissue, then operated again as the infection continued to advance. Jake underwent more than fifteen surgeries over several weeks. His face was progressively damaged by both the disease and the debridement required to contain it. His physicians told his parents, Elsa and Phil Finkbonner, that he would likely die, and that if he survived he would be severely disfigured.\n\nHis family prayed for the intercession of Blessed Kateri Tekakwitha, who had been beatified in 1980. A relic of Kateri was obtained and placed with Jake. Sisters and parishioners from the local community joined in prayer.\n\nThe infection stopped. Physicians could not explain the arrest of what had been an inexorably advancing disease. Jake recovered. His facial scarring was significantly less severe than his medical team had anticipated. He left the hospital alive, mobile, and recognizable.\n\nThe case was submitted to the Vatican's Consulta Medica for evaluation. The medical board reviewed the full record — the diagnostic documentation, the surgical reports, the pathology — and declared the outcome scientifically inexplicable. Pope Benedict XVI approved the miracle in 2011. Kateri Tekakwitha was canonized on October 21, 2012. Jake Finkbonner and his family were present at the ceremony in Rome.`,
        has_primary_sources: true,
      },
      {
        slug: "vanishing-of-smallpox-scars",
        title: "Vanishing of Smallpox Scars at Death",
        miracle_category: "associated",
        type: "other",
        topics: ["native-and-indigenous"],
        date_of_event: "1680-04-17",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "during_lifetime",
        location_name: "Kahnawake, Quebec",
        location_lat: "45.4147888",
        location_lng: "-73.6773614",
        country: "Canada",
        region: "Quebec",
        recipient_name: "St. Kateri Tekakwitha",
        recipient_gender: "female",
        recipient_country: "Canada",
        recipient_privacy: "public",
        recipient_age_at_event: 24,
        medical_diagnosis: "Lifelong smallpox scarring and impaired vision (contracted age 4)",
        cure_details:
          "Within minutes of her death, multiple witnesses at her deathbed reported that the smallpox scars that had marked Kateri's face since childhood vanished completely. Her skin appeared smooth and unblemished. Accounts recorded by Jesuit priests Claude Chauchetière and Pierre Cholenec, both present or nearby.",
        cure_characteristics: "not_applicable",
        was_medically_verified: false,
        intercessory_medium: "not_applicable",
        vatican_recognized: true,
        used_for_beatification: false,
        used_for_canonization: false,
        published: true,
        synopsis: `Kateri Tekakwitha had carried the marks of smallpox on her face for twenty years. The epidemic that killed her parents and brother in 1660 left her with deep facial scarring and severely compromised eyesight — impairments she bore for the entirety of her short life. She died at Kahnawake on April 17, 1680, at the age of twenty-four.\n\nWithin minutes of her death, the Jesuit missionaries and Native Christians present at her deathbed witnessed something they did not expect. The scarring that had marked her face since childhood began to fade and then disappeared entirely. Her skin became smooth. The transformation was described by those present as sudden and complete — a face that had been visibly marked moments before now appeared unblemished.\n\nAmong those who witnessed this were the Jesuit priests Claude Chauchetière and Pierre Cholenec, both of whom wrote accounts of Kateri's life and death that have survived. Cholenec's biography, written shortly after her death, describes the phenomenon directly. Their testimony was part of the documentation used in her beatification and canonization causes.\n\nThe Church has not formally defined what this transformation was or offered a mechanism for it. It is cited in her cause as evidence of her holiness — a physical sign, witnessed by credible observers, occurring in the immediate aftermath of death. It does not function as a canonization miracle in the canonical sense but has been a persistent element of her devotional story since the seventeenth century.`,
        has_primary_sources: true,
      },

      // ── André Bessette ────────────────────────────────────────────────────────
      {
        slug: "healing-of-giuseppe-carlo-audino",
        published: true,
        title: "Healing of Giuseppe Carlo Audino",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["elderly"],
        date_of_event: "1958-01-01",
        date_precision: "year",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Rochester",
        location_lat: "43.1572850",
        location_lng: "-77.6152140",
        country: "USA",
        region: "New York",
        recipient_name: "Giuseppe Carlo Audino",
        recipient_gender: "male",
        recipient_country: "USA",
        recipient_privacy: "public",
        medical_diagnosis: "Reticulum cell sarcoma (advanced, metastatic — given palliative care only)",
        cure_details:
          "Audino's sarcoma had spread throughout his body, causing massive liver enlargement. Dr. Philip Rubin injected him with radioactive gold intended only to ease suffering. He was cured nearly overnight. Rubin stated: \"There is no clear scientific explanation for his cure.\"",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable",
        used_for_beatification: true,
        used_for_canonization: false,
        synopsis: `Giuseppe Carlo Audino was an Italian immigrant living in Rochester, New York. By 1958, he was dying. A diagnosis of reticulum cell sarcoma — an aggressive cancer of the lymphatic system — had reached an advanced, metastatic stage. The disease had spread throughout his body, causing his liver to swell enormously. His physician, Dr. Philip Rubin, chairman of radiation oncology at the University of Rochester Cancer Center, determined that curative treatment was no longer feasible. Audino was given approximately one month to live.

Dr. Rubin proceeded with palliative measures. He injected Audino with radioactive gold — not to arrest the cancer, but to ease his suffering in the time he had remaining. There was no clinical expectation of recovery. Audino's family was preparing for his death.

He had been praying to Brother André for intercession. André Bessette had died in Montreal in 1937, having spent forty years as the doorkeeper of a religious college, directing the sick who came to him toward Saint Joseph. The crutches and canes that lined the walls of his chapel on Mount Royal stood as testimony to thousands who had claimed healing through his prayers. He had never taken credit. "I do not cure," he had said. "Saint Joseph cures."

Nearly overnight, Audino's condition reversed. The tumor disappeared. Dr. Rubin examined him and could not explain what he found. "There is no clear scientific explanation for his cure," Rubin later stated. The man who had been expected to die within weeks was alive and free of the cancer that had been throughout his body.

The Vatican's Consulta Medica reviewed the full record and concluded that the healing was medically inexplicable — spontaneous, complete, and beyond explanation by the natural course of reticulum cell sarcoma or any known effect of the treatment administered. Pope John Paul II recognized the miracle, and it served as the basis for Brother André's beatification on May 23, 1982.

Giuseppe Carlo Audino attended the beatification ceremony in Rome.`,
        has_primary_sources: true,
      },
      {
        slug: "healing-of-child-traumatic-brain-injury",
        published: true,
        title: "Healing of a Child from Traumatic Brain Injury",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["children"],
        date_of_event: "1999-01-01",
        date_precision: "year",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Quebec, Canada",
        country: "Canada",
        region: "Quebec",
        recipient_gender: "male",
        recipient_country: "Canada",
        recipient_privacy: "confidential",
        recipient_age_at_event: 9,
        medical_diagnosis:
          "Severe traumatic brain injury from bicycle accident, fell into coma, given little hope of recovery",
        cure_details:
          "A 9-year-old boy was struck by a car while riding his bicycle, sustaining severe cranial trauma and falling into a coma. Physicians assessed the damage as irreversible. Family prayed to Brother André and anointed the boy with oil from the Oratory. He recovered rapidly and completely with no lasting neurological damage.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        intercessory_medium: "blessed_oil",
        vatican_recognized: true,
        vatican_decree_date: "2009-12-19",
        vatican_medical_board_verdict: "Declared medically inexplicable",
        used_for_beatification: false,
        used_for_canonization: true,
        synopsis: `In 1999, a nine-year-old boy in Quebec was riding his bicycle when he was struck by a car. The collision caused severe cranial trauma. He was admitted to hospital in critical condition and slipped into a coma. His physicians assessed the brain damage as irreversible. His family was told to prepare for his death.

The boy's relatives prayed to Brother André — the lay brother from Montreal who had been beatified in 1982, and whose Oratory on Mount Royal remained one of the principal Catholic pilgrimage sites in Canada. Following the devotion long associated with Brother André, they also anointed the boy with oil obtained at the Oratory and continued their prayers at his bedside.

The child recovered. Not gradually, in the way that might be attributed to the passage of time and intensive care, but rapidly and completely — in a manner his physicians could not reconcile with the documented severity of the injury. A full neurological recovery from the kind of traumatic brain injury he had sustained was not medically expected. There was no clinical account for what happened.

The case was submitted to a diocesan tribunal in February 2005 — the centenary year of Saint Joseph's Oratory — and referred to the Vatican for formal review. The Consulta Medica, the theologians of the Congregation for the Causes of Saints, and ultimately Pope Benedict XVI all concluded that the healing was scientifically inexplicable and was to be attributed to Brother André's intercession. The decree recognizing the miracle was signed on December 19, 2009. Brother André was canonized by Pope Benedict XVI on October 17, 2010.

The identity of the child has never been publicly disclosed. What is known is that he was a young man from Quebec, and that he was present at the canonization ceremony in St. Peter's Square in Rome in 2010.`,
        has_primary_sources: true,
      },

      // ── Maximilian Kolbe ──────────────────────────────────────────────────────
      // Canonized as martyr — no canonization miracle required; both miracles are for beatification.
      {
        slug: "healing-of-angela-testoni",
        title: "Healing of Angela Testoni",
        miracle_category: "intercessory",
        type: "healing",
        topics: [],
        date_of_event: "1948-07-01",
        date_precision: "month",
        timing_relative_to_saint_death: "posthumous",
        country: "Italy",
        recipient_name: "Angela Testoni",
        recipient_gender: "female",
        recipient_country: "Italy",
        recipient_privacy: "public",
        medical_diagnosis: "Advanced intestinal tuberculosis, considered terminal",
        cure_details:
          "Angela Testoni was cured of advanced intestinal tuberculosis in July 1948 after praying for Maximilian Kolbe's intercession. Her physicians could not explain the resolution of the condition. The cure was accepted as one of two miracles for his beatification.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable",
        used_for_beatification: true,
        used_for_canonization: false,
        synopsis: `Angela Testoni was an Italian woman suffering from advanced intestinal tuberculosis — a disease which, in the late 1940s before effective antibiotic therapy was widely available, was frequently fatal once it reached the terminal stage. Her condition was considered beyond the reach of medicine.

Maximilian Kolbe had been dead for seven years. He had died at Auschwitz on August 14, 1941, and word of his sacrifice — volunteering to take the place of a condemned man he did not know — had spread widely among Polish and Italian Catholics in the years following the war. His cause for beatification had been opened, and his intercession was being sought by many.

Angela Testoni prayed for his intercession. In July 1948, her condition resolved in a manner her physicians could not explain. The tuberculosis cleared completely. The Congregation for the Causes of Saints reviewed the case during the investigation into Kolbe's beatification cause. Medical experts examining the documentation declared the healing scientifically inexplicable. It was accepted as one of two miracles supporting Kolbe's beatification.

Maximilian Kolbe was beatified by Pope Paul VI on October 17, 1971. He was initially beatified as a confessor of the faith — a classification Pope John Paul II overturned eleven years later when, at the canonization in 1982, he declared Kolbe a martyr of charity, the first person to be so designated in the modern canonization process.`,
        has_primary_sources: true,
        published: true,
      },
      {
        slug: "healing-of-francis-ranier",
        title: "Healing of Francis Ranier",
        miracle_category: "intercessory",
        type: "healing",
        topics: [],
        date_of_event: "1950-08-01",
        date_precision: "month",
        timing_relative_to_saint_death: "posthumous",
        country: "Italy",
        recipient_name: "Francis Ranier",
        recipient_gender: "male",
        recipient_country: "Italy",
        recipient_privacy: "public",
        medical_diagnosis: "Severe calcification of the arteries (arteriosclerosis)",
        cure_details:
          "Francis Ranier was cured of severe arterial calcification in August 1950 after praying for Maximilian Kolbe's intercession. His physicians declared the resolution of the condition medically inexplicable. The cure was accepted as the second of two miracles for his beatification.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable",
        used_for_beatification: true,
        used_for_canonization: false,
        synopsis: `Francis Ranier was an Italian man suffering from severe calcification of the arteries — a condition in which the arterial walls harden and narrow due to calcium deposits, restricting blood flow and placing the patient at high risk of cardiac failure, stroke, and other serious complications. In 1950, treatment options were extremely limited; the condition at the severity Ranier presented was considered irreversible.

Nine years had passed since Maximilian Kolbe's death at Auschwitz, and five years since the end of the war. Kolbe's reputation for heroic sanctity — the Polish Franciscan who had offered his life in place of a stranger — was by then well established across Catholic communities in Europe. His cause for beatification had been opened, and his intercession was being sought by many.

Francis Ranier prayed for Kolbe's intercession. In August 1950, his condition resolved in a manner his physicians declared medically inexplicable. The arterial calcification cleared. The Congregation for the Causes of Saints reviewed the case as part of the beatification process. Medical examiners confirmed the healing could not be accounted for by natural means. It was accepted as the second of the two miracles required for Kolbe's beatification.

Maximilian Kolbe was beatified by Pope Paul VI on October 17, 1971. His canonization followed on October 10, 1982, under Pope John Paul II. Because Kolbe was declared a martyr at canonization, no separate canonization miracle was required — the two beatification miracles of Angela Testoni and Francis Ranier remain the only formally recognized miraculous healings in his cause.`,
        has_primary_sources: true,
        published: true,
      },

      // ── Louis & Zélie Martin ──────────────────────────────────────────────────
      {
        slug: "healing-of-pietro-schiliro",
        title: "Healing of Pietro Schiliro",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["children"],
        date_of_event: "2002-06-29",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Monza",
        location_lat: "45.584505",
        location_lng: "9.274247",
        country: "Italy",
        region: "Lombardy",
        recipient_name: "Pietro Schiliro",
        recipient_gender: "male",
        recipient_country: "Italy",
        recipient_privacy: "public",
        recipient_age_at_event: 0,
        medical_diagnosis: "Meconium aspiration syndrome with pulmonary hypertension and multiple pneumothoraces",
        cure_details:
          "Pietro was born on May 25, 2002, at Saint Gérard de Monza hospital. He developed meconium aspiration syndrome, triggering severe pulmonary hypertension and multiple collapsed lungs, and was placed on artificial respiration for forty days. His family prayed a novena to the Venerable Louis and Zélie Martin. On June 29, 2002, his condition began to resolve; he was taken off the respirator on July 3. The Vatican medical commission declared the healing scientifically inexplicable on January 17, 2008.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_decree_date: "2008-01-17",
        vatican_medical_board_verdict: "Declared scientifically inexplicable by the Vatican medical commission",
        used_for_beatification: true,
        used_for_canonization: false,
        synopsis: `Pietro Schiliro was born on May 25, 2002, at Saint Gérard de Monza hospital in Monza, near Milan. From the moment of his birth, he was in critical condition. He had inhaled meconium — fetal waste matter — during delivery, causing meconium aspiration syndrome. The condition triggered severe pulmonary hypertension and multiple pneumothoraces, a series of collapsed lungs. He could not breathe on his own. He was placed on artificial respiration and remained between life and death for forty days.

His parents had nowhere medically to turn. Doctors could not predict whether he would survive, and the severity of his pulmonary injury left little room for optimism.

His family turned to prayer. At the time, Louis and Zélie Martin — the parents of Saint Thérèse of Lisieux — were in the late stages of a beatification cause that had been open since 1994. They were not yet blessed; their cause had reached the stage of Venerable. Pietro's family nonetheless offered a novena asking for their intercession.

On June 29, 2002, Pietro's condition began to turn. The pulmonary complications that had been progressive and unresponsive began to resolve. On July 3, he was taken off artificial respiration. His recovery was complete.

The case was submitted to the Vatican's Congregation for the Causes of Saints. On January 17, 2008, the medical commission declared the healing scientifically inexplicable. Pope Benedict XVI formally approved the miracle on July 3, 2008 — exactly six years to the day after Pietro was taken off the respirator — and set October 19, 2008 as the date of beatification for Louis and Zélie Martin.

Pietro, by then six years old, made a pilgrimage of thanksgiving to Lisieux with his family at the end of 2002, and was photographed with the Martin family relics in 2008.`,
        has_primary_sources: true,
        published: true,
      },
      {
        slug: "healing-of-carmen-valencia",
        title: "Healing of Carmen Perez Pons",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["children", "mothers"],
        date_of_event: "2008-10-15",
        date_precision: "month",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Valencia",
        location_lat: "39.4697065",
        location_lng: "-0.3763353",
        country: "Spain",
        region: "Valencia",
        recipient_name: "Carmen Perez Pons",
        recipient_gender: "female",
        recipient_country: "Spain",
        recipient_privacy: "public",
        recipient_age_at_event: 0,
        medical_diagnosis: "Grade 4 intraventricular hemorrhage (brain hemorrhage) with complications of extreme prematurity (born at approximately 26 weeks)",
        cure_details:
          "Carmen Perez Pons was born in Valencia around October 15, 2008 — approximately four days before the beatification of Louis and Zélie Martin. Born at approximately 26 weeks gestation, she presented with a grade 4 intraventricular hemorrhage, the most severe classification, with outcomes typically fatal or resulting in permanent neurological disability. Barefoot Carmelite nuns at Serra recommended prayers to the newly beatified couple. Over the following weeks, Carmen's condition improved gradually and completely; she was discharged on January 2, 2009. Eight medical experts testified her recovery had no scientific explanation. The Congregation for the Causes of Saints accepted the miracle on March 18, 2015.",
        cure_characteristics: "gradual_complete",
        was_medically_verified: true,
        medical_verification_date: "2013-01-01",
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_decree_date: "2015-03-18",
        vatican_medical_board_verdict: "Eight medical experts testified the recovery had no scientific explanation consistent with the severity of the initial presentation",
        used_for_beatification: false,
        used_for_canonization: true,
        synopsis: `Carmen Perez Pons was born in Valencia, Spain, around October 15, 2008 — approximately four days before the beatification of Louis and Zélie Martin on October 19. She was born extremely prematurely, at approximately twenty-six weeks of gestation, and immediately presented with life-threatening complications. The most severe was a grade 4 intraventricular hemorrhage — bleeding deep within the brain's ventricles, the highest classification of severity. At that grade, outcomes are typically fatal or result in profound and permanent neurological disability. Her physicians did not expect her to survive, and those who did survive such injuries rarely did so without lasting impairment.

Her family, in desperation, reached out to a community of Barefoot Carmelite nuns at Serra, near Valencia. The sisters recommended prayers to the newly beatified Louis and Zélie Martin, whose feast had been celebrated just days before Carmen's birth. The family and the sisters began a novena, asking for their intercession.

Over the weeks that followed, Carmen's condition improved — not in the sudden, overnight reversal that characterizes some miracle cases, but gradually and completely. The hemorrhage resolved. The neurological damage that had been expected did not materialize. She was discharged from hospital on January 2, 2009 — the birthday of Saint Thérèse of Lisieux, the Martins' youngest daughter.

Eight medical experts, as part of the diocesan inquiry opened in 2013, testified that Carmen's recovery had no scientific explanation consistent with the severity of her initial presentation. The Congregation for the Causes of Saints accepted the miracle on March 18, 2015. Louis and Zélie Martin were canonized by Pope Francis on October 18, 2015.

Carmen Perez Pons was present at the canonization ceremony in Rome.`,
        has_primary_sources: true,
        published: true,
      },

      // ── Carlo Acutis ──────────────────────────────────────────────────────────
      {
        slug: "healing-of-matheus",
        title: "Healing of Matheus (Pancreatic Disease)",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["children"],
        date_of_event: "2013-10-01",
        date_precision: "month",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Campo Grande",
        location_lat: "-20.4640173",
        location_lng: "-54.6162947",
        country: "Brazil",
        recipient_name: "Matheus Vianna",
        recipient_gender: "male",
        recipient_country: "Brazil",
        recipient_privacy: "first_name_only",
        medical_diagnosis: "Annular pancreas (congenital duodenal obstruction)",
        cure_details:
          "Mother prayed for Carlo's intercession after learning his story. Physicians had recommended surgery as the only option. The child recovered completely without intervention; obstruction resolved and surgery was no longer required.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_medical_board_verdict: "Declared medically inexplicable by the Consulta Medica; approved by Pope Francis for beatification",
        used_for_beatification: true,
        used_for_canonization: false,
        published: true,
        synopsis: `Matheus Vianna was a young child living in Campo Grande, in the Brazilian state of Mato Grosso do Sul. He had been diagnosed with annular pancreas — a congenital condition in which a ring of pancreatic tissue wraps around the duodenum, compressing it and obstructing the passage of food from the stomach. In children, the condition causes persistent vomiting, poor feeding, and failure to thrive. By the time the obstruction becomes symptomatic, surgery is generally the only remedy. His physicians had assessed his condition and concluded that an operation was unavoidable.\n\nHis mother, searching for help, came across the story of Carlo Acutis — the Italian teenager who had died of leukemia in 2006 and whose beatification cause had been opened. She began praying for Carlo's intercession on her son's behalf.\n\nIn October 2013, Matheus recovered. The obstruction resolved. His physicians found no medical explanation for the change. The surgery they had deemed necessary was no longer required. His case was submitted to the Vatican as part of the beatification investigation.\n\nThe Consulta Medica — the Holy See's independent panel of medical experts — reviewed the documentation. Their verdict was that the healing was medically inexplicable: spontaneous, complete, and without a known natural cause consistent with the condition's established course. Pope Francis approved the miracle. Carlo Acutis was beatified in Assisi on October 10, 2020 — the first person of the millennial generation to receive that designation.\n\nMatheus's full surname has not been publicly disclosed by his family. The Vatican has referred to him as "Matheus" in public communications.`,
        has_primary_sources: true,
      },
      {
        slug: "healing-of-valeria-valverde",
        title: "Healing of Valeria Valverde",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["youth"],
        date_of_event: "2022-07-01",
        date_precision: "month",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Florence",
        location_lat: "43.7697955",
        location_lng: "11.2556404",
        country: "Italy",
        region: "Tuscany",
        recipient_name: "Valeria Valverde",
        recipient_gender: "female",
        recipient_country: "Costa Rica",
        recipient_privacy: "public",
        medical_diagnosis: "Severe traumatic brain haemorrhage",
        cure_details:
          "Mother Lilliana traveled to Assisi to pray at Carlo's tomb. The same day, Valeria began breathing independently without mechanical support. The following day she was able to walk; subsequent imaging found no remaining evidence of the haemorrhage.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        intercessory_medium: "tomb_prayer",
        vatican_recognized: true,
        vatican_decree_date: "2024-05-23",
        vatican_medical_board_verdict: "Declared medically inexplicable by the Consulta Medica; recognized by Pope Francis on May 23, 2024",
        used_for_beatification: false,
        used_for_canonization: true,
        published: true,
        synopsis: `Valeria Valverde was a young Costa Rican woman who was in Florence, Italy, when she fell from her bicycle in July 2022 and suffered a severe traumatic brain haemorrhage. She was transported to hospital in critical condition. Her physicians gave her little chance of survival. Even if she lived, they could not rule out significant neurological damage.\n\nHer mother, Lilliana, traveled to be at her side. At some point during Valeria's hospitalization, Lilliana made the journey from Florence to Assisi — approximately two and a half hours by road — to pray at the tomb of Carlo Acutis in the Sanctuary of the Spoliation. The same day Lilliana prayed at the tomb, Valeria began breathing independently, without mechanical support. The following day, she was able to walk. Subsequent imaging and clinical examination found no remaining evidence of the brain haemorrhage.\n\nValeria's physicians could not account for the recovery. The case was documented and submitted to the Holy See. The Consulta Medica examined the medical record and declared the healing scientifically inexplicable. Pope Francis recognized it as the second miracle required for Carlo Acutis's canonization on May 23, 2024.\n\nCarlo Acutis was canonized in Rome on September 7, 2025, by Pope Leo XIV, alongside Pier Giorgio Frassati. Valeria Valverde attended the ceremony.`,
        has_primary_sources: true,
      },

      // ── Juan Diego ────────────────────────────────────────────────────────────
      {
        slug: "healing-of-juan-jose-barragan-silva",
        title: "Healing of Juan José Barragán Silva",
        miracle_category: "intercessory",
        type: "healing",
        topics: ["addiction", "youth"],
        date_of_event: "1990-05-03",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "posthumous",
        location_name: "Querétaro",
        location_lat: "20.8052225",
        location_lng: "-99.8837376",
        country: "Mexico",
        recipient_name: "Juan José Barragán Silva",
        recipient_gender: "male",
        recipient_country: "Mexico",
        recipient_privacy: "public",
        recipient_age_at_event: 20,
        medical_diagnosis: "Severe traumatic brain and spinal injuries: cranial, cervical, and spinal fractures with intracranial haemorrhage",
        cure_details:
          "Fell ten meters headfirst from an apartment balcony onto cement. His mother, who witnessed the fall, immediately invoked Juan Diego. He lapsed into a coma and emerged from it on May 6 — the same day John Paul II celebrated Juan Diego's beatification in Mexico City. He was discharged approximately one week later.",
        cure_characteristics: "instant_complete",
        was_medically_verified: true,
        medical_verification_date: "1998-01-01",
        intercessory_medium: "prayer_only",
        vatican_recognized: true,
        vatican_decree_date: "2001-12-20",
        vatican_medical_board_verdict: "Five consultors unanimous: medically inexplicable (1998); theological board unanimous (May 2001); decree signed December 20, 2001",
        used_for_beatification: false,
        used_for_canonization: true,
        published: true,
        synopsis: `Juan José Barragán Silva was a twenty-year-old man from Querétaro, Mexico, who had been struggling with drug addiction. On May 3, 1990, he fell from an apartment balcony, dropping ten meters — approximately thirty-three feet — headfirst onto a cement surface below. His mother witnessed the fall and immediately invoked the intercession of Juan Diego, whose beatification Pope John Paul II was then preparing to celebrate in Mexico.\n\nThe injuries were severe: fractures to the spinal column, neck, and cranium, with intracranial haemorrhage. He was hospitalized in critical condition and lapsed into a coma.\n\nOn May 6, 1990 — the same day that Pope John Paul II celebrated Juan Diego's beatification at the Basilica of Our Lady of Guadalupe in Mexico City — Juan José emerged from the coma. The recovery was sudden and unexpected. Within approximately a week, he had recovered sufficiently to be discharged from the hospital. His physicians could not account for the speed or completeness of his recovery given the nature of his injuries.\n\nThe case was submitted to the Holy See as part of the investigation into Juan Diego's canonization. In 1998, five medical consultors for the Congregation for the Causes of Saints reviewed the documentation and declared unanimously that the cure was medically inexplicable. The theological board reviewed the case in May 2001 and was also unanimous. Pope John Paul II signed the decree recognizing the miracle on December 20, 2001.\n\nJuan Diego was canonized on July 31, 2002, in Mexico City.`,
        has_primary_sources: true,
      },
      {
        slug: "tilma-of-guadalupe",
        title: "The Tilma of Our Lady of Guadalupe",
        miracle_category: "associated",
        type: "miraculous_image",
        topics: ["native-and-indigenous"],
        date_of_event: "1531-12-12",
        date_precision: "exact_day",
        timing_relative_to_saint_death: "during_lifetime",
        location_name: "Tepeyac Hill",
        location_lat: "19.4848583",
        location_lng: "-99.1178571",
        country: "Mexico",
        region: "Mexico City",
        recipient_gender: "not_applicable",
        recipient_privacy: "not_applicable",
        cure_details:
          "Mary directed Juan Diego to gather Castilian roses (out of season, unknown in Mexico) from the top of Tepeyac Hill and carry them to the bishop. When he opened his tilma before Bishop Zumárraga, the roses fell and the image of the Virgin was found imprinted on the cactus-fiber cloth. The tilma has not decayed in nearly five centuries; scientific examination has found no brushstrokes, underdrawing, or sizing on the fibers.",
        cure_characteristics: "not_applicable",
        was_medically_verified: false,
        intercessory_medium: "not_applicable",
        vatican_recognized: true,
        used_for_beatification: false,
        used_for_canonization: false,
        published: true,
        synopsis: `On December 9, 1531, Juan Diego was walking near the hill of Tepeyac, north of Mexico City, on his way to Mass. He heard music and saw a luminous young woman who spoke to him in Nahuatl. She identified herself as the Virgin Mary and asked him to go to Bishop Juan de Zumárraga and request that a chapel be built at Tepeyac. Juan Diego went to the bishop. Zumárraga received him courteously but asked for a sign before he would act.\n\nOver the following days Juan Diego returned to the hill, and Mary appeared to him again. On December 12, he set out not for the hill but for the town of Tlatelolco, intending to find a priest for his uncle Juan Bernardino, who was gravely ill and believed to be dying. He tried to avoid the hill. Mary appeared to him anyway, on a path around it, and told him that his uncle had already been healed — which was later confirmed. She directed him to the top of Tepeyac, where he found Castilian roses in bloom. These were roses native to Spain, unknown in this region of Mexico, blooming in December on a barren, frost-touched hill. He gathered them in his tilma — the coarse ayate cloak worn by men of his class, woven from the fibers of the maguey plant — and carried them to the bishop's residence.\n\nWhen he opened the tilma before Zumárraga and his household, the roses fell to the floor. On the cloth where they had rested, the image of the Virgin was found imprinted: a young dark-skinned woman, standing on a crescent moon, clothed in a rose-colored tunic and blue-green mantle, surrounded by rays of light. The bishop knelt. The chapel was built.\n\nThe tilma has been in continuous display for nearly five centuries, now behind thick glass at the Basilica of Our Lady of Guadalupe in Mexico City — the most visited Catholic pilgrimage site in the world, receiving ten to twenty million visitors per year. The cactus-fiber fabric has not disintegrated, despite the material's typical lifespan of twenty to thirty years. Scientific examinations conducted in the twentieth century found no evidence of brushstrokes, no underdrawing, and no sizing applied to the fibers before the image was formed. Infrared and ultraviolet analysis revealed no sketch beneath the image.\n\nThe image is not attributed to Juan Diego himself but to Mary. Juan Diego was the bearer — the one who carried the cloth to the bishop and whose life story frames the event. The tilma is associated with his cause because it was his garment, and the apparitions that produced it were the central experience of his life.`,
        has_primary_sources: true,
      },
    ])
    .returning({ id: schema.miracles.id, slug: schema.miracles.slug });

  console.log(`Inserted ${insertedMiracles.length} miracles.`);

  const miracleId = (slug: string) => {
    const m = insertedMiracles.find((r) => r.slug === slug);
    if (!m) throw new Error(`Miracle not found: ${slug}`);
    return m.id;
  };

  console.log("Seeding miracle saints...");

  await db.insert(schema.miracleSaints).values([
    // John Paul II
    { miracle_id: miracleId("healing-of-sr-marie-simon-pierre"), saint_id: saintId("john-paul-ii") },
    { miracle_id: miracleId("healing-of-floribeth-mora-diaz"), saint_id: saintId("john-paul-ii") },
    // Mother Teresa
    { miracle_id: miracleId("healing-of-monica-besra"), saint_id: saintId("mother-teresa") },
    { miracle_id: miracleId("healing-of-marcilio-haddad-andrino"), saint_id: saintId("mother-teresa") },
    // Padre Pio
    { miracle_id: miracleId("healing-of-consiglia-de-martino"), saint_id: saintId("padre-pio") },
    { miracle_id: miracleId("healing-of-matteo-pio-colella"), saint_id: saintId("padre-pio") },
    { miracle_id: miracleId("stigmata-of-padre-pio"), saint_id: saintId("padre-pio") },
    { miracle_id: miracleId("bilocation-of-padre-pio"), saint_id: saintId("padre-pio") },
    // Faustina Kowalska
    { miracle_id: miracleId("healing-of-maureen-digan"), saint_id: saintId("faustina-kowalska") },
    { miracle_id: miracleId("healing-of-fr-ronald-pytel"), saint_id: saintId("faustina-kowalska") },
    { miracle_id: miracleId("divine-mercy-revelations"), saint_id: saintId("faustina-kowalska") },
    // Gianna Beretta Molla
    { miracle_id: miracleId("healing-of-lucia-sylvia-cirilo"), saint_id: saintId("gianna-beretta-molla") },
    { miracle_id: miracleId("healing-of-elizabeth-comparini-arcolino"), saint_id: saintId("gianna-beretta-molla") },
    // Kateri Tekakwitha
    { miracle_id: miracleId("healing-of-native-american-boy"), saint_id: saintId("kateri-tekakwitha") },
    { miracle_id: miracleId("healing-of-jake-finkbonner"), saint_id: saintId("kateri-tekakwitha") },
    { miracle_id: miracleId("vanishing-of-smallpox-scars"), saint_id: saintId("kateri-tekakwitha") },
    // Andre Bessette
    { miracle_id: miracleId("healing-of-giuseppe-carlo-audino"), saint_id: saintId("andre-bessette") },
    { miracle_id: miracleId("healing-of-child-traumatic-brain-injury"), saint_id: saintId("andre-bessette") },
    // Maximilian Kolbe
    { miracle_id: miracleId("healing-of-angela-testoni"), saint_id: saintId("maximilian-kolbe") },
    { miracle_id: miracleId("healing-of-francis-ranier"), saint_id: saintId("maximilian-kolbe") },
    // Louis & Zélie Martin — both miracles attributed to both saints jointly
    { miracle_id: miracleId("healing-of-pietro-schiliro"), saint_id: saintId("louis-martin") },
    { miracle_id: miracleId("healing-of-pietro-schiliro"), saint_id: saintId("zelie-martin") },
    { miracle_id: miracleId("healing-of-carmen-valencia"), saint_id: saintId("louis-martin") },
    { miracle_id: miracleId("healing-of-carmen-valencia"), saint_id: saintId("zelie-martin") },
    // Carlo Acutis
    { miracle_id: miracleId("healing-of-matheus"), saint_id: saintId("carlo-acutis") },
    { miracle_id: miracleId("healing-of-valeria-valverde"), saint_id: saintId("carlo-acutis") },
    // Juan Diego
    { miracle_id: miracleId("healing-of-juan-jose-barragan-silva"), saint_id: saintId("juan-diego") },
    { miracle_id: miracleId("tilma-of-guadalupe"), saint_id: saintId("juan-diego") },
  ]);

  console.log("Seeding miracle sources...");

  await db.insert(schema.miracleSources).values([
    // John Paul II - M1
    {
      miracle_id: miracleId("healing-of-sr-marie-simon-pierre"),
      url: "https://www.catholicnewsagency.com/news/the-miracle-that-led-to-john-paul-ii-beatification-12766",
      title: "The miracle that led to John Paul II's beatification - CNA",
      source_type: "news_article",
    },
    // John Paul II - M2
    {
      miracle_id: miracleId("healing-of-floribeth-mora-diaz"),
      url: "https://www.ewtnnews.com/world/europe/woman-healed-by-john-paul-iis-intercession-recounts-miracle",
      title: "Woman healed by John Paul II's intercession recounts miracle - EWTN News",
      source_type: "news_article",
    },
    // Mother Teresa - M1
    {
      miracle_id: miracleId("healing-of-monica-besra"),
      url: "https://www.ewtnnews.com/world/europe/i-was-sure-that-it-was-mother-teresa-who-healed-me",
      title: "'I was sure that it was Mother Teresa who healed me' - EWTN News",
      source_type: "news_article",
    },
    // Padre Pio - M2
    {
      miracle_id: miracleId("healing-of-matteo-pio-colella"),
      url: "https://www.catholicnewsagency.com/news/39950/young-man-healed-by-padre-pio-recounts-story-of-miraculous-cure",
      title: "Young man healed by Padre Pio recounts story of miraculous cure - EWTN News",
      source_type: "news_article",
    },
    // Faustina Kowalska - M1
    {
      miracle_id: miracleId("healing-of-maureen-digan"),
      url: "https://www.ncregister.com/blog/divine-mercy-and-the-digans",
      title: "The Miraculous Cure That Got Sister Faustina Beatified - National Catholic Register",
      source_type: "news_article",
    },
    // Kateri Tekakwitha - M2
    {
      miracle_id: miracleId("healing-of-jake-finkbonner"),
      url: "https://www.ncregister.com/news/pope-approves-miracle-of-kateri-tekakwitha",
      title: "Pope Approves Miracle of Kateri Tekakwitha - National Catholic Register",
      source_type: "news_article",
    },
    // Andre Bessette - M2
    {
      miracle_id: miracleId("healing-of-child-traumatic-brain-injury"),
      url: "https://www.catholicnewsagency.com/search?q=Andre+Bessette+canonization+miracle",
      title: "CNA articles on Andre Bessette canonization miracle",
      source_type: "news_article",
    },
    // Carlo Acutis - M2
    {
      miracle_id: miracleId("healing-of-valeria-valverde"),
      url: "https://www.ewtnnews.com/vatican/carlo-acutis-to-be-first-millennial-saint-pope-francis-recognizes-miracle-for-canonization",
      title: "Carlo Acutis to be first millennial saint: Pope Francis recognizes miracle for canonization - EWTN News",
      source_type: "news_article",
    },
  ]);

  console.log("Seeding saint sources...");

  await db.insert(schema.saintSources).values([
    // John Paul II
    {
      saint_id: saintId("john-paul-ii"),
      url: "https://www.vatican.va/content/francesco/en/homilies/2014/documents/papa-francesco_20140427_omelia-canonizzazioni.html",
      title: "Holy Mass and Canonization of Blesseds John XXIII and John Paul II - Homily of Pope Francis",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("john-paul-ii"),
      url: "https://www.jp2shrine.org/",
      title: "Saint John Paul II National Shrine - Official Site",
      source_type: "other",
    },
    // Mother Teresa
    {
      saint_id: saintId("mother-teresa"),
      url: "https://www.vatican.va/content/francesco/en/homilies/2016/documents/papa-francesco_20160904_omelia-canonizzazione-madre-teresa.html",
      title: "Holy Mass and Canonization of Mother Teresa of Calcutta - Homily of Pope Francis",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("mother-teresa"),
      url: "https://www.motherteresa.org/",
      title: "Mother Teresa Center - Official Site of the Missionaries of Charity",
      source_type: "other",
    },
    // Padre Pio
    {
      saint_id: saintId("padre-pio"),
      url: "https://www.vatican.va/content/john-paul-ii/en/homilies/2002/documents/hf_jp-ii_hom_20020616_padre-pio.html",
      title: "Canonization of Padre Pio of Pietrelcina - Homily of Pope John Paul II",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("padre-pio"),
      url: "https://www.santuariopadrepio.it/",
      title: "Padre Pio Shrine, San Giovanni Rotondo - Official Site",
      source_type: "other",
    },
    // Faustina Kowalska
    {
      saint_id: saintId("faustina-kowalska"),
      url: "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20000430_faustina_en.html",
      title: "Canonization of St. Faustina Kowalska - Vatican Liturgy Page",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("faustina-kowalska"),
      url: "https://www.faustyna.pl/",
      title: "Divine Mercy Sanctuary, Krakow-Lagiewniki - Official Site",
      source_type: "other",
    },
    // Gianna Beretta Molla
    {
      saint_id: saintId("gianna-beretta-molla"),
      url: "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20040516_beretta-molla_en.html",
      title: "Canonization of St. Gianna Beretta Molla - Vatican Liturgy Page",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("gianna-beretta-molla"),
      url: "https://www.vatican.va/content/john-paul-ii/en/homilies/2004/documents/hf_jp-ii_hom_20040516_canonizations.html",
      title: "Canonization of Gianna Beretta Molla - Homily of Pope John Paul II",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("gianna-beretta-molla"),
      url: "https://en.wikipedia.org/wiki/Gianna_Beretta_Molla",
      title: "Gianna Beretta Molla - Wikipedia",
      source_type: "academic",
    },
    // Kateri Tekakwitha
    {
      saint_id: saintId("kateri-tekakwitha"),
      url: "https://www.vatican.va/content/benedict-xvi/en/homilies/2012/documents/hf_ben-xvi_hom_20121021_canonizzazioni.html",
      title: "Canonization of Kateri Tekakwitha and others - Homily of Pope Benedict XVI",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("kateri-tekakwitha"),
      url: "https://www.katerishrine.com/",
      title: "National Shrine of St. Kateri Tekakwitha, Fonda, NY",
      source_type: "other",
    },
    // Andre Bessette
    {
      saint_id: saintId("andre-bessette"),
      url: "https://www.vatican.va/content/benedict-xvi/en/homilies/2010/documents/hf_ben-xvi_hom_20101017_canonizations.html",
      title: "Canonization of Andre Bessette and others - Homily of Pope Benedict XVI",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("andre-bessette"),
      url: "https://www.saint-joseph.org/",
      title: "St. Joseph's Oratory of Mount Royal - Official Site",
      source_type: "other",
    },
    {
      saint_id: saintId("andre-bessette"),
      url: "https://en.wikipedia.org/wiki/Andre_Bessette",
      title: "Andre Bessette - Wikipedia",
      source_type: "academic",
    },
    // Maximilian Kolbe
    {
      saint_id: saintId("maximilian-kolbe"),
      url: "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_19821010_massimiliano_kolbe_it.html",
      title: "Canonization of St. Maximilian Kolbe - Vatican Liturgy Page (Italian)",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("maximilian-kolbe"),
      url: "https://saintmaximiliankolbe.com/",
      title: "St. Maximilian Kolbe - Official Apostolate Site",
      source_type: "other",
    },
    {
      saint_id: saintId("maximilian-kolbe"),
      url: "https://en.wikipedia.org/wiki/Maximilian_Kolbe",
      title: "Maximilian Kolbe - Wikipedia",
      source_type: "academic",
    },
    // Louis Martin
    {
      saint_id: saintId("louis-martin"),
      url: "https://www.vatican.va/content/francesco/en/homilies/2015/documents/papa-francesco_20151018_omelia-canonizzazioni.html",
      title: "Canonization of Louis and Zelie Martin and others - Homily of Pope Francis",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("louis-martin"),
      url: "https://www.thereseoflisieux.org/",
      title: "Sanctuary of St. Therese and the Martin Family, Lisieux - Official Site",
      source_type: "other",
    },
    {
      saint_id: saintId("louis-martin"),
      url: "https://sanctuaire-louisetzelie.com/en/",
      title: "Sanctuary of Louis and Zélie Martin, Alençon - Official Site",
      source_type: "other",
    },
    {
      saint_id: saintId("louis-martin"),
      url: "https://en.wikipedia.org/wiki/Louis_Martin_and_Marie-Azelie_Guerin",
      title: "Louis Martin and Marie-Azelie Guerin - Wikipedia",
      source_type: "academic",
    },
    // Zelie Martin
    {
      saint_id: saintId("zelie-martin"),
      url: "https://www.vatican.va/content/francesco/en/homilies/2015/documents/papa-francesco_20151018_omelia-canonizzazioni.html",
      title: "Canonization of Louis and Zelie Martin and others - Homily of Pope Francis",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("zelie-martin"),
      url: "https://www.thereseoflisieux.org/",
      title: "Sanctuary of St. Therese and the Martin Family, Lisieux - Official Site",
      source_type: "other",
    },
    {
      saint_id: saintId("zelie-martin"),
      url: "https://sanctuaire-louisetzelie.com/en/",
      title: "Sanctuary of Louis and Zélie Martin, Alençon - Official Site",
      source_type: "other",
    },
    {
      saint_id: saintId("zelie-martin"),
      url: "https://en.wikipedia.org/wiki/Louis_Martin_and_Marie-Azelie_Guerin",
      title: "Louis Martin and Marie-Azelie Guerin - Wikipedia",
      source_type: "academic",
    },
    // Carlo Acutis
    {
      saint_id: saintId("carlo-acutis"),
      url: "https://www.carloacutis.com/",
      title: "Associazione Amici di Carlo Acutis - Official Site",
      source_type: "other",
    },
    // Juan Diego
    {
      saint_id: saintId("juan-diego"),
      url: "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20020731_juan-diego_en.html",
      title: "Canonization of St. Juan Diego - Vatican Liturgy Page",
      source_type: "vatican_decree",
    },
    {
      saint_id: saintId("juan-diego"),
      url: "https://en.wikipedia.org/wiki/Juan_Diego",
      title: "Juan Diego - Wikipedia",
      source_type: "academic",
    },
    {
      saint_id: saintId("juan-diego"),
      url: "https://virgendeguadalupe.mx/",
      title: "Basilica of Our Lady of Guadalupe - Official Site",
      source_type: "other",
    },
  ]);

  console.log("Seeding saint locations...");

  await db.insert(schema.saintLocations).values([
    // John Paul II
    { saint_id: saintId("john-paul-ii"), location_name: "Wadowice, Poland", lat: "49.883333", lng: "19.483333", location_type: "birthplace" },
    { saint_id: saintId("john-paul-ii"), location_name: "Vatican City (St. Peter's Basilica)", lat: "41.902200", lng: "12.453400", location_type: "tomb" },
    { saint_id: saintId("john-paul-ii"), location_name: "Vatican City", lat: "41.902200", lng: "12.453400", location_type: "death_place" },
    { saint_id: saintId("john-paul-ii"), location_name: "Sanctuary of St. John Paul II, Krakow, Poland", lat: "50.005200", lng: "19.974200", location_type: "shrine" },
    { saint_id: saintId("john-paul-ii"), location_name: "Divine Mercy Sanctuary, Krakow, Poland (relic)", lat: "50.054700", lng: "19.935100", location_type: "relic" },

    // Mother Teresa
    { saint_id: saintId("mother-teresa"), location_name: "Skopje, North Macedonia", lat: "42.000000", lng: "21.433333", location_type: "birthplace" },
    { saint_id: saintId("mother-teresa"), location_name: "Mother House of the Missionaries of Charity, Kolkata, India", lat: "22.544800", lng: "88.354200", location_type: "tomb" },
    { saint_id: saintId("mother-teresa"), location_name: "Mother House of the Missionaries of Charity, Kolkata, India", lat: "22.544800", lng: "88.354200", location_type: "death_place" },
    { saint_id: saintId("mother-teresa"), location_name: "Basilica of the Sacred Heart, Kolkata, India", lat: "22.544800", lng: "88.354200", location_type: "shrine" },

    // Padre Pio
    { saint_id: saintId("padre-pio"), location_name: "Pietrelcina, Benevento, Italy", lat: "41.200000", lng: "14.850000", location_type: "birthplace" },
    { saint_id: saintId("padre-pio"), location_name: "San Giovanni Rotondo, Foggia, Italy", lat: "41.705800", lng: "15.727800", location_type: "tomb" },
    { saint_id: saintId("padre-pio"), location_name: "San Giovanni Rotondo, Foggia, Italy", lat: "41.705800", lng: "15.727800", location_type: "death_place" },
    { saint_id: saintId("padre-pio"), location_name: "Our Lady of Grace Capuchin Church, San Giovanni Rotondo", lat: "41.705800", lng: "15.727800", location_type: "shrine" },

    // Faustina Kowalska
    { saint_id: saintId("faustina-kowalska"), location_name: "Glogowiec, Poland", lat: "52.050000", lng: "18.900000", location_type: "birthplace" },
    { saint_id: saintId("faustina-kowalska"), location_name: "Divine Mercy Sanctuary, Krakow-Lagiewniki, Poland", lat: "50.054700", lng: "19.935100", location_type: "tomb" },
    { saint_id: saintId("faustina-kowalska"), location_name: "Krakow, Poland", lat: "50.054700", lng: "19.935100", location_type: "death_place" },
    { saint_id: saintId("faustina-kowalska"), location_name: "Divine Mercy Sanctuary, Krakow-Lagiewniki, Poland", lat: "50.054700", lng: "19.935100", location_type: "shrine" },

    // Gianna Beretta Molla
    { saint_id: saintId("gianna-beretta-molla"), location_name: "Magenta, Milan, Italy", lat: "45.466667", lng: "8.883333", location_type: "birthplace" },
    { saint_id: saintId("gianna-beretta-molla"), location_name: "Monza, Italy", lat: "45.583333", lng: "9.266667", location_type: "death_place" },
    { saint_id: saintId("gianna-beretta-molla"), location_name: "Mesero Cemetery, Mesero, Italy", lat: "45.500000", lng: "8.850000", location_type: "tomb" },
    { saint_id: saintId("gianna-beretta-molla"), location_name: "Sanctuary of Santa Maria Nascente, Ponte Lambro, Italy", lat: "45.833333", lng: "9.216667", location_type: "shrine" },

    // Kateri Tekakwitha
    { saint_id: saintId("kateri-tekakwitha"), location_name: "Ossernenon (Auriesville, New York, USA)", lat: "42.983333", lng: "-74.316667", location_type: "birthplace" },
    { saint_id: saintId("kateri-tekakwitha"), location_name: "Kahnawake, Quebec, Canada", lat: "45.416667", lng: "-73.583333", location_type: "death_place" },
    { saint_id: saintId("kateri-tekakwitha"), location_name: "St. Francis Xavier Mission, Kahnawake, Quebec, Canada", lat: "45.416667", lng: "-73.583333", location_type: "tomb" },
    { saint_id: saintId("kateri-tekakwitha"), location_name: "St. Kateri National Shrine, Auriesville, New York, USA", lat: "42.983333", lng: "-74.316667", location_type: "shrine" },
    { saint_id: saintId("kateri-tekakwitha"), location_name: "St. Kateri Shrine, Fonda, New York, USA", lat: "42.950000", lng: "-74.383333", location_type: "shrine" },

    // Andre Bessette
    { saint_id: saintId("andre-bessette"), location_name: "Mont-Saint-Gregoire, Quebec, Canada", lat: "45.366667", lng: "-73.150000", location_type: "birthplace" },
    { saint_id: saintId("andre-bessette"), location_name: "St. Joseph's Oratory, Montreal, Quebec, Canada", lat: "45.491600", lng: "-73.622200", location_type: "tomb" },
    { saint_id: saintId("andre-bessette"), location_name: "St. Joseph's Oratory, Montreal, Quebec, Canada", lat: "45.491600", lng: "-73.622200", location_type: "death_place" },
    { saint_id: saintId("andre-bessette"), location_name: "St. Joseph's Oratory, Montreal, Quebec, Canada", lat: "45.491600", lng: "-73.622200", location_type: "shrine" },

    // Maximilian Kolbe
    { saint_id: saintId("maximilian-kolbe"), location_name: "Zdunska Wola, Poland", lat: "51.600000", lng: "18.933333", location_type: "birthplace" },
    { saint_id: saintId("maximilian-kolbe"), location_name: "Auschwitz-Birkenau, Poland", lat: "50.033333", lng: "19.183333", location_type: "death_place" },
    { saint_id: saintId("maximilian-kolbe"), location_name: "Basilica of St. Maximilian Kolbe, Niepokalanow, Poland", lat: "52.233333", lng: "20.316667", location_type: "tomb" },
    { saint_id: saintId("maximilian-kolbe"), location_name: "Auschwitz-Birkenau, Poland", lat: "50.033333", lng: "19.183333", location_type: "shrine" },
    { saint_id: saintId("maximilian-kolbe"), location_name: "Niepokalanow Monastery, Poland", lat: "52.233333", lng: "20.316667", location_type: "shrine" },

    // Louis Martin
    { saint_id: saintId("louis-martin"), location_name: "Bordeaux, France", lat: "44.833333", lng: "-0.566667", location_type: "birthplace" },
    { saint_id: saintId("louis-martin"), location_name: "Alencon, France", lat: "48.433333", lng: "0.083333", location_type: "death_place" },
    { saint_id: saintId("louis-martin"), location_name: "Basilica of St. Therese, Lisieux, France", lat: "49.050000", lng: "0.233333", location_type: "tomb" },
    { saint_id: saintId("louis-martin"), location_name: "Alencon, France (family home)", lat: "48.433333", lng: "0.083333", location_type: "shrine" },

    // Zelie Martin
    { saint_id: saintId("zelie-martin"), location_name: "Gandelain, France", lat: "48.483333", lng: "-0.033333", location_type: "birthplace" },
    { saint_id: saintId("zelie-martin"), location_name: "Alencon, France", lat: "48.433333", lng: "0.083333", location_type: "death_place" },
    { saint_id: saintId("zelie-martin"), location_name: "Basilica of St. Therese, Lisieux, France", lat: "49.050000", lng: "0.233333", location_type: "tomb" },
    { saint_id: saintId("zelie-martin"), location_name: "Alencon, France (family home)", lat: "48.433333", lng: "0.083333", location_type: "shrine" },

    // Carlo Acutis
    { saint_id: saintId("carlo-acutis"), location_name: "London, England", lat: "51.507400", lng: "-0.127800", location_type: "birthplace" },
    { saint_id: saintId("carlo-acutis"), location_name: "Monza, Italy", lat: "45.583333", lng: "9.266667", location_type: "death_place" },
    { saint_id: saintId("carlo-acutis"), location_name: "Sanctuary of the Spoliation, Assisi, Italy", lat: "43.066667", lng: "12.616667", location_type: "tomb" },
    { saint_id: saintId("carlo-acutis"), location_name: "Assisi, Italy", lat: "43.066667", lng: "12.616667", location_type: "shrine" },
    { saint_id: saintId("carlo-acutis"), location_name: "Santa Maria Maggiore, Rome, Italy (first-class relic)", lat: "41.897500", lng: "12.498900", location_type: "relic" },

    // Juan Diego
    { saint_id: saintId("juan-diego"), location_name: "Cuauhtitlan, Mexico", lat: "19.683333", lng: "-99.183333", location_type: "birthplace" },
    { saint_id: saintId("juan-diego"), location_name: "Tepeyac Hill, Mexico City, Mexico", lat: "19.484400", lng: "-99.117500", location_type: "death_place" },
    { saint_id: saintId("juan-diego"), location_name: "Basilica of Our Lady of Guadalupe, Mexico City", lat: "19.484400", lng: "-99.117500", location_type: "tomb" },
    { saint_id: saintId("juan-diego"), location_name: "Basilica of Our Lady of Guadalupe, Mexico City", lat: "19.484400", lng: "-99.117500", location_type: "shrine" },
  ]);

  console.log("Seeding complete.");
  console.log(`  Saints: ${insertedSaints.length}`);
  console.log("  Saint relations: 2");
  console.log(`  Miracles: ${insertedMiracles.length}`);
  console.log("  Miracle sources: 8");
  console.log("  Saint sources: 31");
  console.log("  Saint locations: 50");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
