
export enum WarmEmbedColor {
    Active = '#57F287',
    Issued = '#FEE75C',
    Inactive = '#ED4245'
}

/**
 * The number of embeds that will show when viewing warning. Value can not be greater than 5. This is a Discord limit
 * @see {@link https://discord.com/developers/docs/resources/message#create-message-jsonform-params}
 */
export const numberOfWarnEmbedsOnPage = 3
